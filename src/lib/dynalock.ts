const AWS = require('aws-sdk');

export class Dynalock {
    tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    createTable() {
        const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'});
        console.log("Creating " + this.tableName);

        var params = {
            AttributeDefinitions: [
               {
              AttributeName: "ResourceId", 
              AttributeType: "S"
             }
            ], 
            KeySchema: [
               {
              AttributeName: "ResourceId", 
              KeyType: "HASH"
             }
            ], 
            ProvisionedThroughput: {
             ReadCapacityUnits: 5, 
             WriteCapacityUnits: 5
            }, 
            TableName: this.tableName
           };

        return new Promise(function(resolve, reject) {
              dynamoDb.createTable(params, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else     resolve(data); 
            });
        });
    }

    availableLeases() {
        return [{id: 1}, {id: 2}];
    }
}