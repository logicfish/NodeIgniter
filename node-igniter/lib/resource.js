/**
 * Resources are loaded from storage in the following fashion.
 * 
 * A .js file with the name of the schema is loaded using 'require'.
 * This is used as the prototype for loaded objects of that schema type.
 * If the schema is a plain Object (does not modify it's prototype)
 * then the schema's prototype is set to a new object, which is loaded
 * from a '.json' file with the same name as the schema.  Properties in
 * the json file become 'static' properties of the schema type.
 * 
 * Resources may be created inline from data array/object's, or loaded
 * singly or in bulk from .json files or other storage.  The default
 * resource loader reads .json files - modules may contribute their own
 * schema loaders.  Resource schemas may bind themselves to specific engines.  
 * 
 */

var path = require('path');

var NI_Main = require(path.join(__dirname,'main')).NI_Main;

function NIResource() {}

module.exports.NIResource = NIResource;

NIResource._schema = {};

NIResource.load = function(uri,schema,cb) {
	if(typeof schema === 'function') {
		cb = schema;
		schema = undefined;
	}
	if(typeof schema === 'undefined') {
		schema = NIResouce.schemaFor(uri);
	} 
	
	return NIResource.find(uri) || NIResource.create(schema,uri);
};

NIResource.schemaFor = function(uri) { };
NIResource.findSchema = function(name) {
	return NIResource._schema[name] || NIResource.createSchema(name);
};
NIResource.find = function(uri) {
};
NIResource.create = function(schema,uri) { 
	if (typeof schema === 'string') {
		schema = NIResource.findSchema(schema) || {};
	}
	var o = NI_Main.NI.sysLocator(schema.modelsLocation,uri);
	if(typeof o === 'undefined') {
		throw new Error('Resource not found: '+uri);
	}
	o.__proto__ = schema;
	return o;
};
NIResource.createSchema = function(name,props) {
	if(typeof props === 'undefined') {
		props = {};
	}
	var schema = NI_Main.NI.sysLocator('models',name);
//	props.__proto__ = schema;
//	return props;
	return schema;

};