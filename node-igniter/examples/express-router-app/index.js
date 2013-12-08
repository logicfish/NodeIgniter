
// automatically load express-router-app.json and express-router-app.js , if found.
var ni = require('../../').NI('express-router-app');

// Create custom router:
// function MY_Router() {
// };
// MY_Router.prototype = new (ni.module('express-router'));

// An app object is generated by the framework using a prototype containing properties from the exports of 'express-router-app.js'.
// Invoke express-router-app.js:main...
ni.app.main();
