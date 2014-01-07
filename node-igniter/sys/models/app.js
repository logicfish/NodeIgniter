/**
 * Default class prototype for 'app' model objects.
 */

var events = require('events');
var log4js = require('log4js');

//module.exports = Object.create(new events.EventEmitter);
module.exports = {};

/*module.exports.config = function(){
	return this.ni.config.apply(this.ni,arguments);
};*/

module.exports.log = function() { 
	return this._log || (this._log = log4js.getLogger("app:"+this.appName));
};

module.exports.start = function() {
	var event = this.ni.events().event('app/Start',this);
//	this.ni.events().post(event,function(err,res){
//		if(err) {
//			throw err;
//		}
//		if(typeof res === 'function') {
//			process.nextTick(res);
//		}
//	});
	this.ni.events().post(event);

};

module.exports.close = function(res) {
	this.log().info("Closing application: " + (res||""));
	var event = this.ni.events().event('app/Close',this,res);
	this.ni.events().post(event);
};

module.exports.exit = function(res) {
	this.log().debug("App exiting: " + res);
	this.ni.exit(res);
}

module.exports.run = function(argv) {
	this.start();
	var res = 0;
	if(typeof this.main === 'function') {
		res = this.main(argv);
	}
	this.close(res);
};

module.exports.modelsLocation = function() { 
	return "models/apps";
};

