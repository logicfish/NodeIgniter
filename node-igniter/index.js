/**
 * The main command line tool.  Launches the default app ('ni'), or
 * loads the app specified on the command line (--app=...).
 */

var log4js = require('log4js');
var logger = log4js.getLogger("NI");

var path = require('path');
var argv = require('optimist').argv;

var NI_Main = require(path.join(__dirname,'lib','main')).NI_Main;

new NI_Main().run();
