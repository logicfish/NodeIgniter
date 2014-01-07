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
	this._resource.ni = this;

	var config = this.lib('config');
	this._config = new config(this);
}

NI_Main.prototype.events = function(){
	var eventSource = this.lib('eventsource');
	return this._events || (this._events = new eventSource());		
};


NI_Main.prototype.close = function(res) {
	var ni = this;
	if(typeof this.app === 'object') {
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

NI_Main.prototype.sysLocator = function(type,name,props) {
	logger.trace('sysLocator '+type+' : '+name);
	var staticResource,resource,resTop;

	/*if(typeof name==='undefined') {
		var fname = path.join(this.dirName,type+".json");
		if(fs.existsSync(fname)) {
			logger.trace('sysLocator found json '+fname);
			staticResource = require(fname);
		}
		fname = path.join(this.dirName,type+".js");
		if(fs.existsSync(fname)) {
			logger.debug('sysLocator found js '+fname);
			resource = require(fname);
		}
		return NI_Main.makeResource(resource, staticResource);
	}*/
	if(typeof this.config.config !== 'undefined') {
		var dirs = this.config.config.sysDirs;
		for(var i in dirs) {
			var dir = this.expand(dirs[i]);
			if(typeof name === 'function') {
				logger.debug("sysEnum -- "+path.join(dir,type));
				var cb = name;
//				fs.readdir(path.join(dir,type),function(err,files){
//					if(err) {
//						logger.warn(err);
//						throw err;
//					}
//					logger.debug("enum -- "+files.toString());
//					files.each(function(fname){cb(fname);});					
//				});
				var files = fs.readdirSync(path.join(dir,type));
				files.forEach(function(fname){
					cb(fname);
				});
			} else {
				var fname = path.join(dir,type,"index.js");
				logger.trace('sysLocator file '+name+" @ "+fname);
				if(fs.existsSync(fname)) {
					var _res = require(fname);
					if(name in _res) {
						logger.trace('sysLocator found js '+fname + " . "+name);
						resource = _res[name];
						NI_Main.makeResource(props, resource);
					}
				}

				fname = path.join(dir,type,name+".js");
				logger.trace('sysLocator file '+fname);
				if(fs.existsSync(fname)) {
					logger.trace('sysLocator found js '+fname);
					if(typeof resource !== 'undefined') {
						//resource = NI_Main.makeResource(resource,_resource);
						throw new Error("Class already defined for "+fname);
					} else {
						resource = require(fname);
						if(typeof props !== 'undefined') {
//							resource.__proto__ = props;
							NI_Main.makeResource(props, resource);
						}
					}
				}				

				if(typeof resource === 'undefined') {
					resource = props;
				}
				
				fname = path.join(dir,type,"index.json");
				logger.trace('sysLocator file '+name+" @ "+fname);
				if(fs.existsSync(fname)) {
					var _res = require(fname);
					if(name in _res) {
						logger.trace('sysLocator found json '+fname + " . " + name);
						if(typeof resource!=='undefined') {
							//_res[name].__proto__ = resource;
							NI_Main.makeResource(resource,_res[name]);
						}
						if(typeof staticResource !== 'undefined') {
							//staticResource = NI_Main.makeResource(staticResource,_res);
							//_res[name].__proto__ = staticResource;
							NI_Main.makeResource(staticResource,_res[name]);
						}
						staticResource = _res[name];
					}
				}
				
				fname = path.join(dir,type,name+".json");
				logger.trace('sysLocator file '+fname);
				if(fs.existsSync(fname)) {
					logger.trace('sysLocator found json '+fname);
					var _res = require(fname);
					if(typeof resource!=='undefined') {
						//_res.__proto__ = resource;
						NI_Main.makeResource(resource,_res);
					}
					if(typeof staticResource !== 'undefined') {
						staticResource = NI_Main.makeResource(staticResource,_res);
					} else {
						staticResource = _res;
					}
				}
			}
		}
	}
//	if(typeof resource === 'undefined' && typeof props!=='undefined') {
//		if(typeof resource !== 'undefined') {
//			logger.debug("prototyping js.");
//			resource.__proto__ = props;
//		} else if(typeof staticResource !== 'undefined'){
//			logger.debug("prototyping static.");
//			//staticResource = NI_Main.makeResource(staticResource,props);
//			props.__proto__ = staticResource;
//			staticResource = props;
//		}
//	}
	return staticResource;
};

NI_Main.prototype.modLocator = function(type,name) {
	if(typeof this.module === 'undefined') {
		return undefined;
	}
	var module = this.module();
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
		
	this.events().post(this.events().event('app/Init',app));

//	app = Object.create(app);
	this.app = app;
	
	process.nextTick(function(){
		if(typeof cb === 'function') {
			cb(app);
		}
	});

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
	this._lib[name] = require(path.join(__dirname,'sys',libName));
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

NI_Main.prototype.run = function() {
	var ni = this;
	ni.events().hook('app/Start',function(event){
		return function() {
			logger.debug('app/Start ' + ni.app.appVersion + " - "+ni.app.appDesc);
			var res=-1;
			try {
				res = ni.app.main(argv);
			} finally {
				ni.app.close(res);
			}
		};
	});
	ni.events().hook('app/Close',function(event){
		return function() {
			logger.debug('app/Close ' + ni.app.appVersion + " - "+ni.app.appDesc);
			event.source().exit(event.props());
		};
	});

	ni.app(argv.app,function (app){
		logger.info('loaded app niVersion-' + ni.config('config').niVersion);
		app.start();
	});
};

NI_Main.makeResource = function(proto,resource) {
	if(typeof proto === 'undefined') {
		return resource;
	}
	if(typeof resource !== 'undefined') {
		var p = resource;
		while(p.__proto__ && p.__proto__ !== Object.prototype) {
			p = p.__proto__;
		}
		p.__proto__ = proto;
	}

	return resource;
};


module.exports.NI_Main = NI_Main;


