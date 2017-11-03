import { test } from 'ava'
import { Dynalock } from 'dynalock'
import { Lease } from 'dynalock'

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

  AWS.mock('DynamoDB', 'updateItem', function (params, callback) {
    callback(null, { Attributes:
    { Holder: { S: 'foo.github.com' },
      Expiration: { N: '1509712036' },
      ResourceId: { S: 'E16479F0' } } })
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

test('renew lease', async t => {
  let retVal = await client.renewLease('E16479F0')
  t.true(retVal.expiration === '1509712036')
  t.true(retVal.holder === 'foo.github.com')
  t.true(retVal.resourceId === 'E16479F0')
})
