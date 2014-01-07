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
	if(argv._.length===0) {
		this.showUsage();
	} else {
		var toolName = argv._[0];
		var tool = this.ni._resource.load(toolName,'tool');
		if(typeof tool === 'undefined') {
			throw new Error("Tool not found: "+toolName);
		}
		return tool.exec(process.argv.slice(2,process.argv.length));
	}
	
	return 0;
};

module.exports.showUsage = function(argv) {
	console.log('Usage: ni <tool> ...');
	console.log('Tools:');
	var ni = this.ni;
	ni._resource.enumResources('tool',function(res){
		var help;
		if(path.extname(res)!=='.json') {
			return;
		}
		if(path.basename(res,'.json')==='index') {
			/*var index = require(res);
			for(i in index) {
				if(index.hasOwnProperty(i)) {
					help = this.showHelp(i);
				}
			}*/
		} else {
			help = showHelp(path.basename(res,'.json'));
		}
		//console.log("TOOL - "+path.basename(res,'.json'));
		if(help) {
			console.log(help);
		}
	});
	function showHelp(toolName) {
		var tool = ni._resource.load(toolName,'tool');
		var help = toolName + " - ";
		if(typeof tool.toolHelp === 'function'){
			help += tool.toolHelp();
		} else if(typeof tool.toolHelp === 'string'){
			help += tool.toolHelp;			
		}
		return help;
	};
}

