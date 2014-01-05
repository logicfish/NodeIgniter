/**
 * New node file
 */

function NISchema() {}

NISchema.loadObject = function(schema,data) {
	var parser = this.parser(schema);
	return parser(data);
};

NISchema.parseSchema = function(schema) {
	return function(data) {
		
	};
};