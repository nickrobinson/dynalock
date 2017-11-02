import { test } from 'ava'
import { Dynalock } from 'typescript-starter'

let client = new Dynalock("fake");

const AWS = require('aws-sdk-mock');

test.beforeEach(() => {
    AWS.mock('DynamoDB', 'createTable', function (params, callback){
      callback(null, "successfully created table");
    });      
});

test('createTable', async t => {
  var retVal = await client.createTable();
  t.true(retVal === "successfully created table");
})

test('availableLeases', t => {
  t.true( client.availableLeases().length == 2 );
})