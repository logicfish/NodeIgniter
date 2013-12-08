NodeIgniter
===========

The aim of this project is to create a Laravel style modular framework for node-js.

We're also going to ignite node, setting it on fire.


Proposed structure
------------------

The difference between this type of loading and the default 'require' from commonjs, is that this loader creates a type heirarchy from 'module.exports' which caters for both global and local overrides, and also allows for injection semantics.  A node-igniter module or application creates a 'class' which is instantiated by the framework and exposed to other modules via local and global hashing.  

### Heirarchial Module loading

	var NodeIgniter = require('node-igniter');

	var NI = new NodeIgniter();
	var m = NI.module('name');
	var myvalue = m.config('name').myvalue;
	// the loaded data becomes available as a property on the module.config object.
	var othervalue = m.config.name.othervalue;

### Module folder structure

Each of these exports a sub-module called **name**.

* modules.js - module.exports.**name** = ...

or:

* modules/index.js - module.exports.**name** = ...

or:

* modules/**name**.js
* modules/**name**-**version**.js

or:

* modules/**name**/index.js
* modules/**name**/**version**/index.js

The same mechanism is used for configs. Each of these declares a config named **name**:

* config/index.json - "**name**" : { ... }

or

* config/**name**.json

or

* config/**name**/index.json
* config/**name**/**configname**.json

Module meta-data:
* config/module.json - this module.
* config/modules.json - child modules.
* modules/**name**/config/module.json - info about a sub-module.

#### Structure of the *modules* folder

* modules/**name**/config/**configname**.json
* modules/**name**/modules/<.. embedded modules ..>

Modules may have nested sub-modules to any level.  If more than one module or sub-module shares the same name-space, then local overrides take precedence; that is, if a module contains a sub-module matching an already defined modules namespace, then the module and it's children will view the overridden module, rather than the global version. 

Module name/versions are hashed in a global registry, however if a module contains a sub-module with the same name as a global entry, the sub-module will override the global module, inside it's parent module.  This is acheived by using the global module's exported object as the prototype for the sub-module's exported object.

Configuration objects are also managed using prototypes, so that all modules access a global configuration set, and may also include their own private configurations which may include local overrides for global settings.  When a module is loaded, a unique configuration object is created for that module, with it's prototype set to the global configuration object.

Sub-modules may be declared public or private.  If they are public, they will be bound to the global namespace; otherwise, they will only be visible from the parent module.  Declaring a sub-module as public is directly equivalent to creating a top-level module of the same name/version.

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

Module exports are added to class prototypes; when a module is imported an instance of the class is provided to the importing module.  The importing module can access the internal prototype by providing a callback which allows the importing module to modify the prototype for the module object representing the imported module.

Exports are hashed by module name and version.  These are stored in a tree which maps the sub-module heirarchy.  When a request for an import occurs, the tree is scanned for a match against the exporting modules name and version.  The highest matching exporting module will be used to create the initial prototype.  We then create a new prototype which inherits the initial one, and pass this along to the import callback.  An import object is then created using the prototype.  This becomes a property of the importing module's 'module' object, using the namespace parameter as the name of the property.  Before doing this, the module config object is created.

A module import may reference an npm module if their is a matching one available.  In this case, the module class prototype is created from the value returned by 'require(...)'.  Require is also used to load data objects from json files.

### Resource Loader

Syntax:
	this.resource(uri,[param],[callback]);
Returns: The result of applying the callback function to a value returned from a registered resource loader for a particular URI.  If no callback function is given, the result of the resource loader is returned directly.

Generic 'resource' function which allows URI mapping and loads any resource type. eg: 
	this.resource('config:sys/temp');
	this.resource('sys:/config/temp');
	this.resource('sysconfig:/temp');
map an individual item or property:
	var bar = this.resource('config:sys/foo#bar');
nested properties:
	var foobar = this.resource('config:sys/foo#bar/foobar');
	var foobar = this.resource('config:sys/foo#bar.foobar');
send some custom parameters (functor):
	var foo = this.resource('foo:/bar#doSomething',{ foo : 'bar' })();

reference parameters:
	var foo = this.resource('http://localhost:8080/foo?a=$a&b=$b',{a:'foo',b:'bar'}).get();

The resource loader provides a generic lookup and query engine for the framework.

Resource loaders lever the prototype system to provide a unique local view of the heirarchy to each loaded module.

A URI may be resolved by the loader to map any object type, or to 'undefined'. The type of the returned object is determined by the schema handler which may return a different object type for each URI.  

Automatically map external resource loaders, 
eg: 
	this.resource('http://localhost:8080/foo').post({ foo : 'Foo' });
	this.resource('http://localhost:8080/foo#post',{ foo : 'Foo' });
Async:
	this.resource('...',function (err,res) { ... });

In the general case, the resource method 'opens' the resource and invokes the callback function.  However in the case of http URLs for example, the resource will be an instance of 'request'.  'config:' url's return the json object (using 'require'), and 'data:' url's return the file contents. 'js:' url's return the common.js module exports (using 'require').

The async method can return a new 'value' for the resource. Optionally, the new value may set the old value as it's prototype.  The resource loader may or may not set the returned 'new' value as a property of the resource.  The new value is used as the return value for the 'resource' function (?).

'resource:' urls map to filesystem objects in the 'resources' sub-folder of an application, a module, or it's submodules.

URI fragments - the anchor refers to individual elements (properties) within a resource.
eg:
	this.resource('js:router/my-router#get') = function(req,res) { ... }
	this.resource('routes:/my-router#post',function(err,res) {
		return function(req,res) { ... };
	});

The resource tree is identical to the modular heirarchy, with the 'modules' folders coallesced into layers; for example, the file modules/foo/modules/bar/resources/example.txt would be accessible via the URI 'resource:foo/bar/example.txt'

Variables: the syntax **$symbol** inside a URI is translated to a config lookup, and replaced with the value of the local configuration var of the same name, if one exists.
Example: file:$dirname/res.txt

Extending the loader
We can easily create additional loaders for a schema and register these globally.
For example, we could create loaders for URI schemas "fiber:..." or "backbone:...", which would then be available to all modules.  The lookup would return 'undefined' if the loader is not registered, which allows for lose-coupling.

### Local Module Configuration Prototypes
When functions defined in a module access their local configuration (via this.config, or this.foo), they will be accessing the object created during the module import, containing local per-module (and per-import) overrides, which in turn may be overridden by the global app config.  The same happens when they acces the resource layer - local resources will override inherited ones, but the application can create global overrides which cannot be modified.

The module config object is created during an import, before creating the import object (part of the module instance).  The config object also uses a prototype heirarchy to allow local overrides.  At the high end are config objects created from the exporting module's config/ folder (the config loader is used to read a configuration with the same name as the module).  If the module is a sub-module, parent modules are also scanned for config objects which are included in the prototype chain.  The exported config objects are attached to the module exports.  These are used to create prototypes for module imports, which allow for importing modules to override any of the config settings.  (An application can override settings globally for every module).  If a module contains a config with a name matching an imported module, the named config object will have it's prototype set to the config of the exporting module.  

When an import occurs, the framework creates an object with it's prototype set to the value of the local config object (from the importing module) with the same name as the imported module.  This object is attached to the 'module' object which is passed to the callback in the importing module.  We're not done yet - we make a clone of the application (global) config object of the same name as the importing module; we set this objects prototype to the object we just created.  Next we clone the 'params' object passed in to the importing function, and set the protype of the apps-global object to point to here; this objects prototype is the one passed to the callback, whose prototype is the original config object from the exporting module.  This is the object that will be attached to the module instance, and available to functions inside the module to access their config settigns.  This gives files in the application's top level configs/ folder (and the config.js file) a special power.  They allow us to override per-module settings globally.  

The callback method of the loader functions allow for modification of the config prototypes.

Module loading will default to npm (commonjs) if no matching module is found during an import. If we're in dev mode, then 'npm install --save' may be invoked in the containing module or application's folder in order to resolve missing imports.

Should the config object be the prototype for the module type, enabling config vars to be available as properties of the module instance?

### Module Temporary file space
* tmp/**name**/<... temporary files ...>

### Loading Semantics

Load different module versions and imported namespace.
	NI.module('name','0.1.1');
	NI.module('name','9.1.1','namespace');
	NI.module('name','0.1.1','namespace', callback);
	NI.module('name',callback);
	NI.module('name','0.2',callback);

or, override module config settings locally:
	var param = { namespace : '...', version : '...', config : {...} };
	NI.module('name',param,callback);
	
The 'module' and 'config' methods delegate to the resource loader, by creating a URI from the given arguments.  The resource loader then delegates to the appropriate schema handler. The possibility exists for schema loaders to accept XPath semantics, executing queries.

Inside a module, using 'this' pointer.
	this.module('foo').doSomething(bar);
After the loader has been invoked, the module is available as a property of the 'module' class property (this.module).
	this.modules(['foo','bar']);
	this.module.bar.doSomething();

### Examples:

	var NI = require('node-igniter').NI('example-app');
	var app_config = NI.config('app');
	var express = NI.module('express');
	app = express();
	var server = NI.module('http');
	server.start(app);


	NI.module('mylib');
	NI.module.mylib.doSomething();


	// extend a module prototype inline.
	var ni_request = NI.module.load('request',function(module){
		this.prototype.myvar = module.config.myvar;
	};

	// inside a module
	var foo = this.module('foo'); // sub-module
	var bar = this.config.bar; // config variable.

### Resources
Useful nodejs modules:
* [autoload] [0]
* [hashish] [1]

[0]: https://github.com/laverdet/node-autoload
[1]: https://github.com/substack/node-hashish
