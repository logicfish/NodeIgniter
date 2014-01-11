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
var util = require("util");
var logger = require('log4js').getLogger('lib:Resource');

function NIResource() {
}

module.exports = NIResource;

NIResource._schema = {};
NIResource._uri = {};

NIResource.load = function(uri,schema,cb) {
	if(typeof schema === 'function') {
		cb = schema;
		schema = undefined;
	}
	if(typeof schema === 'undefined') {
		schema = NIResouce.schemaFor(uri);
	} 
	logger.info('load '+uri+' '+schema);
	
	return NIResource.find(uri) || NIResource.create(schema,uri);
};

NIResource.schemaFor = function(uri) {
	logger.debug("schemaFor "+uri);
};
NIResource.findSchema = function(name) {
	logger.debug('findSchema '+name);
	return NIResource._schema[name] || (NIResource._schema[name] = NIResource.createSchema(name));
};
NIResource.find = function(uri) {
	logger.debug('find '+uri);
	return NIResource._uri[uri];
};

NIResource.create = function(schema,uri) { 
	logger.debug('create '+uri+' '+util.inspect(schema));
	if (typeof schema === 'string') {
		//schema = NIResource.findSchema(schema) || { schemaName:schema };
		schema = NIResource.findSchema(schema);
	}
	if(typeof schema === 'undefined') {
		throw new Error('Unknown schema.');
	}
	logger.debug('schema '+schema.schemaName + " @ "+schema.modelsLocation);
	if(typeof uri === 'undefined') {
		return schema;
	}
	var o = NIResource.ni.sysLocator(schema.modelsLocation||schema.schemaName,uri,schema);
	if(typeof o === 'undefined') {
		//throw new Error('Resource not found: '+uri);
		return undefined;
	}
	//o.__proto__ = schema;
//	return (NIResource._uri[uri] = Object.create(o));
	return (NIResource._uri[uri] = o);
};

NIResource.createSchema = function(name,props) {
	logger.debug('createSchema '+name);
	if(typeof props === 'undefined') {
		props = {};
	}
	var schema = NIResource.ni.modLocator('models',name,props);

//	if(typeof schema === 'undefined') {
//		schema = {};
//	}
//	schema.__proto__ = props;
	schema =  NIResource.ni.sysLocator('models',name,schema);
	if(typeof schema === 'undefined') {
		schema = { schemaName : '<undefined>' };
	}
	//_schema.__proto__ = schema;
	//return Object.create(_schema);
	logger.debug("created schema: "+util.inspect(schema));
	return schema;
};

NIResource.enumResources = function(schema,cb) {
	if (typeof schema === 'string') {
		schema = NIResource.findSchema(schema);
	}
	logger.debug('enum '+schema.schemaName);
	this.ni.sysLocator(schema.modelsLocation||schema.schemaName,cb);
};
