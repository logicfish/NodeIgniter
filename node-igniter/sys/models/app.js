/**
 * Default class prototype for 'app' model objects.
 */

var events = require('events');
var log4js = require('log4js');

module.exports.__proto__ = new events.EventEmitter();

module.exports.config = function(){
	return this.ni.config.apply(this.ni,arguments);
};

module.exports.log = function() { 
	return this._log || (this._log = log4js.getLogger(this.appName));
};

module.exports.modelsLocation = "models/apps";
