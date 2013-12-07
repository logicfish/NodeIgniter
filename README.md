NodeIgniter
===========

The aim of this project is to create a Laravel style modular framework for node-js.


Proposed structure
------------------

### Module loading

var NodeIgniter = require('node-igniter');

var NI = new NodeIgniter();
var m = NI.load('modulename');
var value = m.config('value');

### Module folder structure

*	modules/index.js - (exports 'modulename')
or:
*	modules/<modulename>.js
or:
*	modules/<modulename>/index.js

#### Structure inside a module folder

*	modules/<modulename>/config/<configname>.json
*	modules/<modulename>/resources/<.. static file content ..>
*	modules/<modulename>/modules/<.. embedded modules ..>

Module names are entered in a global registry, however if a module contains a sub-module with the same name as a global entry, the sub-module will override the global module, inside it's parent module.  This is acheived by using the global module's exported object as the prototype for the sub-module's exported object.
Configuration objects are also managed using prototypes, so that all modules access a global configuration set, and may also include their own private configurations which may include local overrides for global settings.  When a module is loaded, a unique configuration object is created for that module, with it's prototype set to the global configuration object.

### Examples:


	var ni_express = NI.load('express');
	var ni_server = NI.load('http');
	var ni_request = NI.load('request');



