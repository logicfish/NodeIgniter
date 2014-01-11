/**
 * New node file
 */
var log4js = require('log4js');
var logger = log4js.getLogger('Tools');
var spawn = require('child_process').spawn;

module.exports.exec = function(argv) {
	logger.info('Exec tool: '+argv);
	if(typeof this.toolMain === 'function') {
		return this.toolMain(argv);
	} else if (typeof this.toolMain === 'string') {
		var _argv = argv.splice(1,argv.length);
		//var proc = spawn(this.toolMain,_argv, { stdio: 'inherit' });
		var appLogger = log4js.getLogger("Tool::"+this.toolMain);
		var proc = spawn(this.toolMain,_argv,{ 
			cwd: process.cwd(),
			env: process.env
		});
		proc.on("error",function(msg){
			logger.warn(msg);
		});
		proc.on('close', function (code) {
			logger.info('child process exited with code ' + code);
		});
		proc.stderr.on("data",function(msg){
			appLogger.warn(msg.toString());
		});
		proc.stdout.on("data",function(msg){
			appLogger.info(">>>\n"+msg.toString()+"\n<<<");
		});

		logger.info('Spawn: ['+this.toolMain + "] ["+_argv.toString() +"] - "+proc.pid);
	}
};

