// Node.js should resolve this to the root of the repo. Since the path returns a
// directory, node will look for the `main` property in `package.json`, which
// should point to the `main` build.
var starter = require('dynalock');

// now we can use the library
var assert = require('assert');

var locker = new starter.Dynalock('fake');

// locker.createResource("E16479F0").then(function(value) {
//     console.log(value);
// }).catch(function(e) {
//     console.log(e);
// });

function lockHandler() {
    locker.availableLeases().then(function(value) {
        if (value.length == 0) {
            console.log("No Leases Available");
            setTimeout(lockHandler, 30000);
        } else {
            var lease = value[0];

            locker.captureLease(lease.resourceId['S']).then(function(value) {
                console.log("Captured lease for " + lease.resourceId['S']);
            
                function renew() {
                    locker.renewLease(lease.resourceId['S']).then(function(value) {
                        console.log("Renewed lease");
                    }).catch(function(e) {
                        console.log("Unable to renew lease");
                    })
                }
                
                setInterval(renew, 20000);
            }).catch(function(e) {
                console.log(e);
                console.log("Could not capture lock");
            });
        }
        console.log(value);
    }).catch(function(e) {
        console.log(e);
    })
}

lockHandler();