NodeIgniter
===========

The aim of this project is to create a Laravel style modular framework for node-js.


Proposed structure
------------------

### Module loading

	var NodeIgniter = require('node-igniter');

	var NI = new NodeIgniter();
	var m = NI.module('name');
	var myvalue = m.config('name').myvalue;
	// the loaded data becomes available as a property on the module.config object.
	var othervalue = m.config.name.othervalue;

### Module folder structure

* modules.js - exports.**name** = ...

or:

* modules/index.js - exports.**name** = ...

or:

* modules/**name**.js
* modules/**name**-**version**.js

or:

* modules/**name**/index.js
* modules/**name**/**version**/index.js

The same mechanism is used for configs, ie:
* config/index.json - "**name**" : { ... }

or

* config/**name**.json

or

* config/**name**/index.json
* config/**name**/**config**.json

Module meta-data:
* config/module.json - this module.
* config/modules.json - child modules.
* modules/**name**/config/module.json - info about a sub-module.

#### Structure of the *modules* folder

* modules/**name**/config/**configname**.json
* modules/**name**/modules/<.. embedded modules ..>

Modules may have nested sub-modules to any level.  If more than one module or sub-module shares the same name-space, then local overrides take precedence; that is, if a module contains a sub-module matching an already defined modules namespace, then the module and it's children will view the overridden module, rather than the global version. 

Module names are entered in a global registry, however if a module contains a sub-module with the same name as a global entry, the sub-module will override the global module, inside it's parent module.  This is acheived by using the global module's exported object as the prototype for the sub-module's exported object.

Configuration objects are also managed using prototypes, so that all modules access a global configuration set, and may also include their own private configurations which may include local overrides for global settings.  When a module is loaded, a unique configuration object is created for that module, with it's prototype set to the global configuration object.

### Ideas

Supports but does not require the HMVC pattern.

The loader can run 'npm install' inline to initialise modules with a package.json descriptor, and can install ni-modules from listed npm dependencies.

Modules can override default settings in *module.json* .
Modules and applications can override default behaviour by creating classes prefixed with MY for example MY _ Configuration .

Automatically assign loaders to assignable objects, for example folders and .js files.

* modules/**name**/resources/<.. static file content ..>
* modules/**name**/models/ index.js | **name**.js | **name**/
* modules/**name**/views/

The _module.resources_, _module.models_ and _module.views_ objects are automatically created by the framework which iterates the file-system looking for loadable items.  This enables clients to load objects using the _module.models('name')_ syntax, simply by creating the relevant folder (models/).  The default folders, config/ and modules/, are pre-registered in the framework (using [autoload] [0]) to allow for their special semantics.  
Users can override the default loaders for the automatically assigned classes by creating the classes MY _ Model and MY _ View (MY _  followed by the name of the loader with the initial letter capitialised) which will be loaded by the framework instead of the default loader classes.  The default system loader is NI _ ResourceLoader .  A MY _ ResourceLoader class would override the default loader.  
Loaders default to using a require(...) statement to create the resource object, and assign a property of the same name to it's prototype with it's value as the resource object.  

Temporary file space
* tmp/**name**/<... temporary files ...>

### Loading Semantics

Load different module versions and imported namespace.
	NI.module('name','0.1.1');
	NI.module('name','9.1.1','namespace');
	NI.module('name','0.1.1','namespace', callback);
	NI.module('name',callback);


### Examples:


	var ni_express = NI.module('express');
	app = ni_express();

	var app_config = NI.config('app');

	NI.module('mylib');
	NI.module.mylib.doSomething();

	var ni_server = NI.module('http');

	// extend a module prototype inline.
	var ni_request = NI.module.load('request',function(module){
		this.prototype.myvar = module.config.myvar;
	};


### Resources
Useful nodejs modules:
* [autoload] [0]
* [hashish] [1]

[0]: https://github.com/laverdet/node-autoload
[1]: https://github.com/substack/node-hashish
