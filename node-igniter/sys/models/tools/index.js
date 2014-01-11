/**
 * Tools module.
 */

var path = require('path');
var logger = require('log4js').getLogger('tools/index');

var tools = module.exports = function() {};

tools.help = function() {};
tools.help.toolMain = function(argv) {
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
	});
};


tools.prompt = function(){};
tools.prompt.toolMain = function(argv) {
	
};
