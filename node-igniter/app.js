/**
 * New node file
 */

var app = module.exports = function(ni) {
	this.ni = ni;
};

app.prototype.main = function() {
	console.log("app.main");
	console.log(this.ni.config('config')['niVersion']);
};
