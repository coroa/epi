/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app'),
    mergeTrees = require('broccoli-merge-trees'),
    pickFiles = require('broccoli-static-compiler');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import("vendor/ember-localstorage-adapter/localstorage_adapter.js");

app.import("vendor/d3/d3.js");

var bootstrapFonts = pickFiles('vendor/bootstrap-sass/dist/fonts', {
    srcDir: '/',
    destDir: '/fonts'
});

// Merge the app tree and our new font assets.
module.exports = mergeTrees([app.toTree(), bootstrapFonts]);
