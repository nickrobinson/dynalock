import { Lease } from './lease'
import * as os from 'os'

const AWS = require('aws-sdk')

export class Dynalock {
  tableName: string

  constructor (tableName: string) {
    this.tableName = tableName
  }

  createTable () {
    const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})
    console.log('Creating ' + this.tableName)

    let params = {
      AttributeDefinitions: [
        {
          AttributeName: 'ResourceId',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'ResourceId',
          KeyType: 'HASH'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: this.tableName
    }

    return new Promise(function (resolve, reject) {
      dynamoDb.createTable(params, function ( err, data ) {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  createResource (resourceId: string) {
    const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})

    let params = {
      Item: {
        'ResourceId': {
          S: resourceId
        }
      },
      TableName: this.tableName
    }

    return new Promise(function (resolve, reject) {
      dynamoDb.putItem(params, function (err, data) {
        if (err) console.log(err, err.stack)
        else resolve(data)
      })
    })
  }

  availableLeases () {
    const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})

    let params = {
      ExpressionAttributeValues: {
        ':e': {
          N: Math.floor(Date.now() / 1000).toString()
        }
      },
      FilterExpression: 'Expiration < :e',
      TableName: this.tableName
    }

    return new Promise<Lease[]>(function (resolve, reject) {
      dynamoDb.scan(params, function (err, data) {
        if (err) {
          console.log(err, err.stack)
          reject(err)
        } else {
          let leases: Lease[] = []
          data['Items'].forEach(element => {
            leases.push(new Lease(element['ResourceId'], element['Expiration'], element['Holder']))
          })
          resolve(leases)
        }
      })
    })
  }

  captureLease (resourceId: string) {
    const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})
    const leaseExpiration = (Math.floor(Date.now() / 1000) + 30)
    const leaseHolder = os.hostname()

    let params = {
      Item: {
        'ResourceId': {
          S: resourceId
        },
        'Expiration': {
          N: leaseExpiration.toString()
        },
        'Holder': {
          S: leaseHolder
        }
      },
      TableName: this.tableName,
      ExpressionAttributeNames: {
        '#E': 'Expiration'
      },
      ExpressionAttributeValues: {
        ':expiration': {'N': Math.floor(Date.now() / 1000).toString()}
      },
      ConditionExpression: '#E < :expiration'
    }

    return new Promise<boolean>(function (resolve, reject) {
      dynamoDb.putItem(params, function (err, data) {
        if (err) {
          console.log(err, err.stack)
          reject(err)
        } else {
          console.log(data)
          resolve(true)
        }
      })
    })
  }
}
