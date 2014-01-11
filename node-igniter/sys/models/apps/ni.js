/**
 * New node file
 */

var path = require('path');

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
	
	//if(argv._.length===0) {
		//this.showUsage();
//	} else {
		var toolName = argv._[0] || "prompt";
		this.log().info("toolName " + toolName);
		//var tool = this.ni._resource.load(toolName,'tool');
		var tool = this.ni.model('tool',toolName);
		if(typeof tool === 'undefined') {
			throw new Error("Tool not found: "+toolName);
		}
		return tool.exec(process.argv.slice(2,process.argv.length));
//	}
//	return 0;
};

//module.exports.showUsage = function(argv) {
//}

