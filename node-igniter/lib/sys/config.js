/**
 * Notes on the 'config' system.
 * 
 * Configuration objects are 
 * 
 */
var path = require('path');
var fs = require('fs');

var config = module.exports = function(ni) {
	this.ni = ni;
};

/**
 * Load configuration from the system folders.
 * @param name
 * @returns
 */
config.prototype.loadSys = function(name) {
	var fname = path.join(this.ni.dirName,name+".json");
	if(fs.existsSync(fname)) {
		return require(fname);
	}
	return this.ni.sysLocator('config',name);
};
config.prototype.loadMod = function(name) {
	if(typeof this.ni.module === 'undefined') {
		return undefined;
	}
//	var module = this.ni.module;
//	var fname = path.join(module.path,name+".json");
//	if(fs.existsSync(fname)) {
//		return require(fname);
//	}
	return this.ni.modLocator('config',name);
};

config.prototype.load = function(name,cb) {
	var cfg;
	var cfgSys = this.loadSys(name);
	var cfgMod = this.loadMod(name);

	if(typeof cfgMod!=='undefined'&&typeof cfgSys!=='undefined') {
		cfgSys.__proto__ = cfgMod;
	}
	if(typeof cfgSys!=='undefined') {
		cfg = cfgSys;
	} else if(typeof cfgMod!=='undefined') {
		cfg = cfgMod;
	}
	if(typeof cfg==='undefined') {
		throw Error('Not found: '+name);
	}

	if(typeof cb === 'function') {
		process.nextTick(function(){cb(cfg);});
	}
	return cfg;
};
