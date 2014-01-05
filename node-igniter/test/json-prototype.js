var assert = require("assert");

describe('Object', function(){
  describe('#__proto__', function(){
    it('Create inherited properties from JSON prototype', function(){

    	var test = require('./data/test.json');
    	assert.notEqual('undefined',typeof test.foo);
    	
    	var test2 = require('./data/test2.json');

    	assert.equal('undefined',typeof test2.foo);
    	assert.notEqual('undefined',typeof test2.bar);
    	
    	test2.__proto__ = test;
    	
    	assert.notEqual('undefined',typeof test2.foo);
    	assert.notEqual('undefined',typeof test2.bar);
    	
    	var test3 = require('./schema/test3');
    	assert.notEqual('undefined',typeof test3.test3fnc);
    	assert.notEqual('undefined',typeof test3.test3string);
    	assert.equal('undefined',typeof test3.foo);
    	assert.equal('undefined',typeof test3.bar);

    	test3.__proto__ = test2;

    	assert.notEqual('undefined',typeof test3.test3fnc);
    	assert.notEqual('undefined',typeof test3.test3string);
    	assert.notEqual('undefined',typeof test3.foo);
    	assert.notEqual('undefined',typeof test3.bar);
    });
  });
});
