/**
 * New node file
 */

var web = module.exports = {};

web.prototype.modInit = function() {
	this.ni.events().hook('app/Start',function(){return startWeb;});
	function startWeb() {
		
	};
};