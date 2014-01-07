/**
 * New node file
 */
var logger = require('log4js').getLogger('Tools');
var spawn = require('child_process').spawn;

module.exports.exec = function(argv) {
	logger.info('Exec tool: '+argv);
	if(typeof this.toolMain === 'function') {
		return this.toolMain(argv);
	} else if (typeof this.toolMain === 'string') {
		var pid = spawn(this.toolMain,argv, { stdio: 'inherit' });
		logger.info('Spawn: '+this.toolMain + " - "+argv.toString() +" - "+pid.pid);
	}
};

