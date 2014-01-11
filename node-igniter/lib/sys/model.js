/**
 * New node file
 */

var logger = require('log4js').getLogger('lib:Model');

var model = module.exports = function(ni) {
	this.ni = ni;
};

model.prototype.load = function(type,id,cb) {
	logger.debug('load '+type+' '+id);
	return this.ni._resource.load(id,type,cb);
};
