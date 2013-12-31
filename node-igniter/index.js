/*
//module.exports = function() {
//};

//module.exports.NI = new NodeIgniter();

// usage: var ni = require('node-igniter').NI;


// Default resource.
// This class wraps the classloader.
// TODO refactor the code below into classes using extends library, and proper definition of properties.
function NI_Resource(type) {
	this._type = type;
};

NI_Resource.prototype.object = function() {
	function F(){};
	F.prototype = this;
	return new F();
};

NI_Resource.prototype.load = function(name,param,cb) {
	var namespace = name;
	if(typeof param.namespace !== 'undefined') {
		namespace = param.namespace;
	} else {
		param.namespace = name;
	}
	// TODO get version.
	if(typeof this._resource[namespace] === 'undefined') {
		this._load(name,param);
	}
	var r = this._resource[namespace];
	if(typeof cb === 'function') {
		cb(r);
	}
	return r;
};


// Module loader.  

function NI_ModuleLoader() {
};

NI_ModuleLoader.prototype = new NI_Resource('modules');

NI_ModuleLoader.prototype.load = function(name,param,callback) {
	var moduleConfig = this._config(name);
	var paramConfig = param.clone();
	paramConfig.prototype = moduleConfig;
	
	var module = this.findModule(name,param);

	var appConfig = this._configLoader.appConfig(name);
	appConfig.prototype = paramConfig;
	
	module.config = this._config.loader(module,paramConfig);
	//
	callback(module);
	//
	var namespace = param.namespace;
	// polymorphic config loader.
	module.config = this._config.loader(module,appConfig);
	// set properties of 'this' and '_modules' objects.
	this._modules[namespace] = module;
	this[namespace] = module;
};

NI_ModuleLoader.prototype.unload = function(name,param) {
	if(typeof this[name] !== 'undefined') {
		this[name] = undefined;
	}
	if(typeof this._modules[name] !== 'undefined') {
		this._modules[name] = undefined;
	}
};

NI_ModuleLoader.prototype.findModule = function(name,param) {
};

NI_ModuleLoader._modules = {};
//NI_ModuleLoader._config = new NI_ConfigLoader(this);

// Config loader
//
function NI_ConfigLoader() {
}

NI_ConfigLoader.prototype = new NI_Resource('config');

function NI_Config(loader) {
	this._loader = loader;
	this._config = {};
}

NI_Config.prototype.get = function(key,cb) {
	if(typeof cb === 'function') {
		cb(this._config[key]);
	}
	return this._config[key];
};
*/

// start again.

var log4js = require('log4js');
var logger = log4js.getLogger("NI");

var path = require('path');
var events = require('events');

function NI_Main() {
	logger.info("NI starting...");
	var config = require(path.join(__dirname,'lib','config'));
	this._config = new config(this);
	this._event = new events.EventEmitter();
	this.appName = '<undefined>';
}

NI_Main.prototype.expand = function(v) {
	return v.replace('@dirname',__dirname).replace('@appname',this.appName);
}

NI_Main.prototype.app = function(name,cb) {
	var app = require(path.join(process.cwd(),name));
	this.appName = name;
	app = this.app = new app(this);
	if(typeof cb === 'function') process.nextTick(function(){cb(app);});
	this._event.emit('app-loaded',app);
	return this.app;
};

NI_Main.prototype.config = function(name,cb) {
	if(typeof name === 'undefined') name = 'config';
	var cfg = this.config[name]; 
	if(typeof cfg==='undefined') {
		this.config[name] = this._config.load(name,cb);
	} else {
		if(typeof cb === 'function')process.nextTick(function(){cb(cfg);});
	}
	return this.config[name];
};

var ni = new NI_Main();

//ni.app('app');
//ni.app.main();

//ni.app('app').main();

ni.app('app',function (app){
	logger.info('loaded app niVersion-' + ni.config('config').niVersion);
	app.main();
});
ni.config('modules');
