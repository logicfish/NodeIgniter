module.exports.main = function() {
	this.module('express-router',{namespace:'router'});
	this.module('http-server',{namespace:'server'});

	this.server.start(this.router);

};
