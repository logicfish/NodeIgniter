/**
 * New node file
 */

module.exports.toolMain = function(argv) {
	console.log("Node");
	require('child_process').fork('.',argv);
};

