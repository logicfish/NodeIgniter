
module.exports = function() {
};

module.exports.NI = new NodeIgniter();

// usage: var ni = require('node-igniter').NI;


// Default resource.
// This class wraps the classloader.
// TODO refactor the code below into this class using extends library, and property setters.
function NI_Resource() {
};

NI_Resource.prototype.object = function() {
	function F(){};
	F.prototype = this;
	return new F();
};

// Module loader.  

function NI_ModuleLoader() {
	var it = function(name,param,callback) {
		var namespace = name;
		if(typeof param.namespace !== 'undefined') {
			namespace = param.namespace;
		} else {
			param.namespace = name;
		}
		// TODO get version.
		if(typeof this._modules[namespace] !== 'undefined') {
			return this[namespace];
		}
		else return this.load(name,param,callback);
	};

	it.prototype = new NI_Resource();

	it.prototype.load = function(name,param,callback) {
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
	it.prototype.unload = function(name,param) {
		if(typeof this[name] !== 'undefined') {
			this[name] = undefined;
		}
		if(typeof this._modules[name] !== 'undefined') {
			this._modules[name] = undefined;
		}
	};
	it.prototype.findModule = function(name,param) {
	};
	it._modules = {};
	it._config = new NI_ConfigLoader(this);
	return it;
};

// Config loader
//
function NI_ConfigLoader() {
	this.prototype = function(name) {
	};
};
