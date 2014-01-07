/**
 * New node file
 */

/*
var app = module.exports = function(ni) {
	this.ni = ni;
};

app.prototype.main = function() {
	console.log("app.main");
	console.log(this.ni.config('config').niVersion);
};
*/
//module.exports = {};
//module.exports.prototype = {};
//module.exports = {};
module.exports.main = function(argv) {
	this.log().info("main " + this.ni.config().niVersion);
	return 0;
};