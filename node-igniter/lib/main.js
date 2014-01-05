/**
 * New node file
 */

var log4js = require('log4js');
var logger = log4js.getLogger("NI_Main");

var path = require('path');
var fs = require('fs');
//var events = require('events');

var argv = require('optimist').argv;

function NI_Main() {
	logger.info("NI starting...");
	if(typeof NI_Main.NI !== 'undefined') {
		throw new Error('NI_Main.NI already defined.');
	}
	NI_Main.NI = this;
	
	var config = require(path.join(__dirname,'config'));
	this._resource = require(path.join(__dirname,'resource')).NIResource;
	
	this._config = new config(this);
//	this._event = new events.EventEmitter();
	
	this.appName = '<undefined>';
	this.dirName = path.join(__dirname,'../');
	
}

NI_Main.prototype.close = function() {
	// fire event...
	var ni = this;
	process.nextTick(doClose);
	function doClose() {
		ni._config = undefined;
		ni._resource = undefined;
		ni.app = undefined;
		NI_Main.NI = undefined;
		
	};
};


NI_Main.prototype.expand = function(v) {
	return v.replace('@dirname',this.dirName).replace('@appname',this.appName).replace('@appdir',process.cwd);
};

NI_Main.prototype.locator = function(type,name) {
	
};

NI_Main.prototype.sysLocator = function(type,name) {
	logger.debug('sysLocator '+type+' : '+name);
	if(typeof name==='undefined') {
		var proto;
		var resource;
		var fname = path.join(this.dirName,type+".json");
		if(fs.existsSync(fname)) {
			logger.debug('sysLocator found '+fname);
			proto = require(fname);
		}
		fname = path.join(this.dirName,type+".js");
		if(fs.existsSync(fname)) {
			logger.debug('sysLocator found '+fname);
			resource = require(fname);
		}
		if(typeof proto !== 'undefined' && typeof resource === 'undefined') {
			resource = {};
		}
		if(typeof proto !== 'undefined') {
			resource.__proto__ = proto;
		}
		if(typeof resource !== 'undefined') {
			return resource;
		}
	}
	if(typeof this.config.config !== 'undefined') {
		var dirs = this.config.config.sysDirs;
		for(var i in dirs) {
			var proto;
			var resource;
			var dir = this.expand(dirs[i]);
			fname = path.join(dir,type,name+".json");
			logger.debug('sysLocator search '+fname);
			if(fs.existsSync(fname)) {
				logger.debug('sysLocator found '+fname);
				proto = require(fname);
			}
			fname = path.join(dir,type,name+".js");
			logger.debug('sysLocator search '+fname);
			if(fs.existsSync(fname)) {
				logger.debug('sysLocator found '+fname);
				resource = require(fname);
			}
			if(typeof proto !== 'undefined' && typeof resource === 'undefined') {
				resource = {};
			}
			if(typeof proto !== 'undefined') {
				resource.__proto__ = proto;
			}
			if(typeof resource !== 'undefined') {
				return resource;
			}
		}
	}
	return undefined;
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
	if(typeof proto !== 'undefined' && typeof resource === 'undefined') {
		resource = {};
	}
	if(typeof proto !== 'undefined') {
		resource.__proto__ = proto;
	}
	if(typeof resource !== 'undefined') {
		return resource;
	}
	return undefined;
};


NI_Main.prototype.app = function(name,cb) {
	var n = this.config().appDefault;
	if(typeof name === 'undefined') {
		name = n;
	}
//	console.assert(typeof app.main !== 'undefined');
	var app = this._resource.load(name,'app');
	
	app.ni = this;
	
	var _app = Object.create(app);
	app = this.app = _app;
	
	_app.appName = name;
	
	this.app = app = _app;
	
	if(typeof cb === 'function') process.nextTick(function(){cb(app);});
	process.nextTick(function(){app.emit('app-start',app);});
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

module.exports.NI_Main = NI_Main;
