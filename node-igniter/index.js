/**
 * The main command line tool.  Launches the default app ('ni'), or
 * loads the app specified on the command line (--app=...).
 */

var log4js = require('log4js');
var logger = log4js.getLogger("NI");

var path = require('path');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/ni.log'),"[all]");

//log4js.configure({
//	  "appenders": [
//	      {
//	          type: "console"
//	        , category: "console"
//	      },
//	      {
//	          "type": "file",
//	          "filename": "logs/ni.log",
//	          "maxLogSize": 1024,
//	          "backups": 3,
//	          "category": "[all]"
//	      }
//	  ]
//	});

var NI_Main = require(path.join(__dirname,'lib','main')).NI_Main;

new NI_Main().run();

