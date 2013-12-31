/**
 * New node file
 */
var path = require('path');
var fs = require('fs');

var config = module.exports = function(ni) {
	this.ni = ni;
};

config.prototype.loadCfg = function(name) {
	var fname = path.join(__dirname,'../',name+".json");
	if(fs.existsSync(fname)) {
		return require(fname);		
	} else {
		fname = path.join(process.cwd(),name+".json");
		if(fs.existsSync(fname)) {
			return require(fname);					
		} else {
			if(typeof this.ni.config() !== 'undefined') {
				var dirs = this.ni.config().sysConfigDirs;
				for(var i in dirs) {
					var dir = this.ni.expand(dirs[i]);
					fname = path.join(dir,name+".json");
					if(fs.existsSync(fname)) {
						cfg = require(fname);
						return cfg;
					}
				}
			}
		}
	}
	return undefined;
};

config.prototype.load = function(name,cb) {
	var cfg = this.loadCfg(name);
	if(typeof cfg==='undefined') throw Error('Not found: '+name);
	if(typeof cb === 'function') process.nextTick(function(){cb(cfg);});
	return cfg;
};
