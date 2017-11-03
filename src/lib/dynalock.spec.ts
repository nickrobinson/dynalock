import { test } from 'ava'
import { Dynalock } from 'typescript-starter'
import { Lease } from 'typescript-starter'

let client = new Dynalock('fake')

const AWS = require('aws-sdk-mock')

test.beforeEach(() => {
  AWS.mock('DynamoDB', 'createTable', function (params, callback) {
    callback(null, 'successfully created table')
  })

  AWS.mock('DynamoDB', 'putItem', function (params, callback) {
    callback(null, {})
  })

  AWS.mock('DynamoDB', 'scan', function (params, callback) {
    callback(null, { Items:
      [ { Holder: [Array], Expiration: [Array], ResourceId: [Array] } ],
      Count: 1,
      ScannedCount: 1 })
  })
})

test('createTable', async t => {
  let retVal = await client.createTable()
  t.true(retVal === 'successfully created table')
})

test('availableLeases', async t => {
  let leases: Lease[] = await client.availableLeases()
  t.true( leases.length === 1 )
})

test('capture lease', async t => {
  t.true(await client.captureLease('E16479F0'))
})

test('create resource', async t => {
  let retVal = await client.createResource('foo')
  t.true(Object.keys(retVal).length === 0)
})
