// Node.js should resolve this to the root of the repo. Since the path returns a
// directory, node will look for the `main` property in `package.json`, which
// should point to the `main` build.
var starter = require('dynalock');

// now we can use the library
var assert = require('assert');

var locker = new starter.Dynalock('fake');

locker.captureLease("E16479F0").then(function(value) {
    console.log(value);
}).catch(function(e) {
    console.log("Could not capture lock");
});
