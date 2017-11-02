import { test } from 'ava'
import { Dynalock } from 'typescript-starter'
import { Lease } from 'typescript-starter'

let client = new Dynalock("fake");

const AWS = require('aws-sdk-mock');

test.beforeEach(() => {
    AWS.mock('DynamoDB', 'createTable', function (params, callback){
      callback(null, "successfully created table");
    });

    // AWS.mock('DynamoDB', 'putItem', function (params, callback){
    //     callback(null, "successfully put item in database");
    // });
});

test('createTable', async t => {
  var retVal = await client.createTable();
  t.true(retVal === "successfully created table");
});

// test('create resource', async t => {
//     var retVal = await client.createResource("foo");
//     t.true(retVal === "successfully put item in database");
// })

test('availableLeases', async t => {
    var leases: Lease[] = await client.availableLeases();
    t.true( leases.length === 1 );
});

test('capture lease', async t => {
    var lease = await client.captureLease("E16479F0");
    t.true(lease.resourceId === "E16479F0");
});