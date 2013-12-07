NodeIgniter
===========

The aim of this project is to create a Laravel style modular framework for node-js.


Proposed structure
------------------

### Module loading

	var NodeIgniter = require('node-igniter');

	var NI = new NodeIgniter();
	var m = NI.module('modulename');
	var myvalue = m.config('value').myvalue;
	// the loaded data becomes available as a property on the module.config object.
	var othervalue = m.config.value.othervalue;

### Module folder structure

* modules/index.js - export.**modulename** = ...

or:

* modules/**modulename**.js

or:

* modules/**modulename**/index.js

The same mechanism is used for configs, ie:
* config/index.json - "**name**" : { ... }

or

* config/**name**.json

or

* config/**name**/index.json



#### Structure of the *modules* folder

* modules/**modulename**/config/**configname**.json
* modules/**modulename**/modules/<.. embedded modules ..>


Module names are entered in a global registry, however if a module contains a sub-module with the same name as a global entry, the sub-module will override the global module, inside it's parent module.  This is acheived by using the global module's exported object as the prototype for the sub-module's exported object.

Configuration objects are also managed using prototypes, so that all modules access a global configuration set, and may also include their own private configurations which may include local overrides for global settings.  When a module is loaded, a unique configuration object is created for that module, with it's prototype set to the global configuration object.

### Ideas

Supports but does not require the HMVC pattern.

Modules can override default settings in *module.json* .
Modules and applications can override default behaviour by creating classes prefixed with MY for example MY _ Configuration .

Automatically assign loaders to assignable objects, for example folders and .js files.

* modules/**modulename**/resources/<.. static file content ..>
* modules/**modulename**/models/ index.js | **name**.js | **name**/
* modules/**modulename**/views/

The _module.resources_, _module.models_ and _module.views_ objects are automaticall created.
Users can override the default loader by create the classes MY _ Model and MY _ View




### Examples:


	var ni_express = NI.module.load('express');
	app = ni_express();

	var app_config = NI.config.load('app');

	var ni_server = NI.module.load('http');

	// extend a module prototype inline.
	var ni_request = NI.module.load('request',function(module){
		this.myvar = module.config('myvar');
	};


### Resources
Useful nodejs modules:
* [autoload](https://github.com/laverdet/node-autoload)


