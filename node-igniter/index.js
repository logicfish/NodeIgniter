/**
 * The main command line tool.  Launches the default app ('ni'), or
 * loads the app specified on the command line (--app=...).
 */

var log4js = require('log4js');
var logger = log4js.getLogger("NI");

var path = require('path');
var argv = require('optimist').argv;

var NI_Main = require(path.join(__dirname,'lib','main')).NI_Main;

/*
var ni = new NI_Main();

ni.events().hook('app/Start',function(event){
	return function() {
		logger.debug('app/Start ' + ni.app.appVersion + " - "+ni.app.appDesc);
		var res=-1;
		try {
			res = ni.app.main(argv);
		} finally {
			ni.app.close(res);
		}
	}
});
ni.events().hook('app/Close',function(event){
	return function() {
		logger.debug('app/Close ' + ni.app.appVersion + " - "+ni.app.appDesc);
		event.source().exit(event.props());
	};
});

ni.app(argv.app,function (app){
	logger.info('loaded app niVersion-' + ni.config('config').niVersion);
	app.start();
});

*/

new NI_Main().run();
