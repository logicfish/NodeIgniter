/**
 * NI_Main - built-in NI functions.
 */

var log4js = require('log4js');
var logger = log4js.getLogger("NI_Main");

var path = require('path');
var fs = require('fs');

var argv = require('optimist').argv;

function NI_Main() {
	logger.info("NI starting...");
	
	// Possible race condition!...
	if(typeof NI_Main.NI !== 'undefined') {
		throw new Error('NI_Main.NI already defined.');
	}
	NI_Main.NI = this;
	
	this.appName = '<undefined>';
	this.dirName = path.join(__dirname,'../');
	
	this._lib = {};
	//var config = require(path.join(__dirname,'config'));

	//this._resource = require(path.join(__dirname,'resource')).NIResource;
	this._resource = this.lib('resource');

	var config = this.lib('config');
	this._config = new config(this);
	
	this.config('config');
}

NI_Main.prototype.events = function(){
	var eventSource = this.lib('eventsource');
	return this._events || (this._events = new eventSource());		
};


NI_Main.prototype.close = function(res) {
	var ni = this;
	if(typeof this.app === 'object') {
		//this.app.emit('app-close',this.app);
		//this.app.event().post('app/Close');
		this.app.close(res)
	}
//	process.nextTick(doClose);
//	function doClose() {
//		ni._config = undefined;
//		ni._resource = undefined;
//		ni._lib = undefined;
//		ni.app = undefined;
//		NI_Main.NI = undefined;
//		process.nextTick(function(){ni.exit(res);});
//	};
};

NI_Main.prototype.exit = function(res) {
	process.nextTick(function(){
		logger.debug("Exiting process "+res);
		process.exit(res);
	});
};
NI_Main.prototype.expand = function(v) {
	return v.replace('@dirname',this.dirName).replace('@appname',this.appName).replace('@appdir',process.cwd);
};

NI_Main.prototype.locator = function(type,name) {
	
};

NI_Main.prototype.sysLocator = function(type,name) {
	logger.trace('sysLocator '+type+' : '+name);
	var proto,resource;
	if(typeof name==='undefined') {
		var fname = path.join(this.dirName,type+".json");
		if(fs.existsSync(fname)) {
			logger.trace('sysLocator found json '+fname);
			proto = require(fname);
		}
		fname = path.join(this.dirName,type+".js");
		if(fs.existsSync(fname)) {
			logger.debug('sysLocator found js '+fname);
			resource = require(fname);
		}
	}
	if(typeof this.config.config !== 'undefined') {
		var dirs = this.config.config.sysDirs;
		for(var i in dirs) {
			var dir = this.expand(dirs[i]);
			var fname = path.join(dir,type,name+".json");
			logger.trace('sysLocator search '+fname);
			if(fs.existsSync(fname)) {
				logger.trace('sysLocator found json '+fname);
				proto = require(fname);
			}
			fname = path.join(dir,type,name+".js");
			logger.trace('sysLocator search '+fname);
			if(fs.existsSync(fname)) {
				logger.trace('sysLocator found js '+fname);
				resource = require(fname);
			}
		}
	}
	return NI_Main.makeResource(proto,resource);
};

NI_Main.prototype.modLocator = function(type,name) {
	if(typeof this.module === 'undefined') {
		return undefined;
	}
	var module = this.module;
	var fname = path.join(module.path,name+".json");
	var proto;
	var resource;
	if(fs.existsSync(fname)) {
		proto = require(fname);
	}
	fname = path.join(module.path,name+".js");
	if(fs.existsSync(fname)) {
		resource = require(fname);
	}
	return NI_Main.makeResource(resource,proto);
};


NI_Main.prototype.app = function(name,cb) {
	name = name || this.config().appDefault;
	var app = this._resource.load(name,'app');
//	console.assert(typeof app.main !== 'undefined');
	app.appName = name;
	app.ni = this;
		
	app.ni.events().post(app.ni.events().event('app/Init',app));

	//app = Object.create(app);
	this.app = app;
	
	process.nextTick(function(){
		if(typeof cb === 'function') {
			cb(app);
		}
	});
	/*
	app.events().hook('app/Close',doClose);
	function doClose(event) {
		ni._config = undefined;
		ni._resource = undefined;
		ni._lib = undefined;
		ni.app = undefined;
		NI_Main.NI = undefined;
		process.nextTick(function(){ni.exit(event.param);});
	};*/

	
	//process.nextTick(function(){app.events().post(app.events().event('app/Start',app));});
	//app.events().post(app.events().event('app/Start',app));
	return this.app;
};

NI_Main.prototype.config = function(name,cb) {
	if(typeof cb === 'undefined' && typeof name === 'function') {
		cb = name;
		name = undefined;
	}
	if(typeof name === 'undefined') {
		name = 'config';
	}
	var cfg = this.config[name]; 
	if(typeof cfg==='undefined') {
		this.config[name] = this._config.load(name,cb);
	} else {
		if(typeof cb === 'function') {
			process.nextTick(function(){cb(cfg);});
		}
	}
	return this.config[name];
};

NI_Main.prototype.lib = function(name,libName) {
	/*if(typeof this._lib === 'undefined') {
		this._lib = {};
	}*/
	logger.trace("lib: " + name + (libName||""));
	if(typeof this._lib[name] === 'undefined') {
		this.loadLibSys(name,libName);
	}
	if(typeof this._lib[name] === 'undefined') {
		this.loadLibMod(name,libName);
	}
	return this._lib[name];
};

NI_Main.prototype.loadLibSys = function(name,libName) {
	logger.debug("loadLibSys: " + name + " - "+libName);
	libName = libName || name;
	this._lib[name] = require(path.join(__dirname,libName));
};
NI_Main.prototype.loadLibMod = function(name,libName) {
	logger.debug("loadLibMod: " + name + " - "+libName);
	libName = libName || name;
	if(typeof this.mod() === 'undefined') return;
	this._lib[name] = require(path.join(this.mod().path,libName));
};

NI_Main.prototype.mod = function(name,param) {
	return this._modules[name] || (this._modules[name] = this._resource.load(name,'module'));
};

NI_Main.makeResource = function(proto,resource) {
	if(typeof resource === 'undefined' && typeof proto !== 'undefined') {
		resource = {};
	}
	if(typeof proto !== 'undefined') {
		resource.__proto__ = proto;
	}
//	if(typeof resource !== 'undefined') {
//		return Object.create(resource);
//	}
//	return undefined;
	return resource;
};

module.exports.NI_Main = NI_Main;


