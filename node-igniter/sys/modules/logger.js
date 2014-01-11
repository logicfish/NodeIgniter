/**
 * New node file
 */

var log4js = require('log4js');

var Logger = module.exports = function(name) {
	var logger = log4js.getLogger(name);
	//logger.addAppender();
	return logger;
};

