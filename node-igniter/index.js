/**
 * The main command line tool.  Launches the default app ('ni'), or
 * loads the app specified on the command line (-app=...).
 */

var log4js = require('log4js');
var logger = log4js.getLogger("NI");

var path = require('path');
var argv = require('optimist').argv;

var NI_Main = require(path.join(__dirname,'lib','main')).NI_Main;


var ni = new NI_Main();

var appName = argv['app'];// || ni.config().appDefault;

ni.app(appName,function (app){
	logger.info('loaded app niVersion-' + ni.config('config').niVersion);
	app.on('app-start',function () {
		ni.config('modules');
		logger.info('loaded app ' + app.appVersion + " - "+app.appDesc);
		app.main(argv);
	});
});

