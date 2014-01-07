/**
 * The main command line tool.  Launches the default app ('ni'), or
 * loads the app specified on the command line (--app=...).
 */

var log4js = require('log4js');
var logger = log4js.getLogger("NI");

var path = require('path');
var argv = require('optimist').argv;

var NI_Main = require(path.join(__dirname,'lib','main')).NI_Main;


var ni = new NI_Main();

ni.events().hook('app/Start',function(event){
	logger.debug('app/Start ' + ni.app.appVersion + " - "+ni.app.appDesc);
	return function() {
		var res=-1,err;
		try {
			res = ni.app.main(argv);
		} catch(_err) {
			err = _err;
		}
		ni.app.close(res);
		if(err) {
			throw err;
		}
	}
});
ni.events().hook('app/Close',function(event){
	logger.debug('app/Close ' + ni.app.appVersion + " - "+ni.app.appDesc);
	return function() {
		logger.trace('app/Close#exit');
		event.source().exit(event.props());
	};
});

ni.app(argv['app'],function (app){
	logger.info('loaded app niVersion-' + ni.config('config').niVersion);
	app.start();
});

