'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
exports.lambdaHandler = async function (event, context, callback) {


    console.log("event: ", JSON.stringify(event));

    let params = {
        TableName: process.env.TableName,
        KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
        ExpressionAttributeNames: {
          "#userID": "userID",
          "#dataType": "dataType"
        },
        ExpressionAttributeValues: {
          ":a": "User#reframQ",
          ":t":  "Component#"
        }  
    };

    let dbResponse = await getComponent(params);
    let resp = dbResponse.data.Items;

    let componentsList = [] ;

    for(let i = 0;i<resp.length;i++)
    {
        componentsList.push({ id: resp[i].data.id,
                              type:resp[i].data.type,
                           name:resp[i].data.name,
                           description:resp[i].data.description
                            });
                                                                                                        
                    
    }

    if (dbResponse.error) {
        return  callback(JSON.stringify({
            statusCode:500,
            body:"error!"
        }));
    }

    return {

        statusCode: 200,
        result: componentsList
    };
};

async function getComponent(params) {

    return new Promise((resolve) => {

        dynamoDb.query(params, (error, data) => {
            resolve({ error, data });
        });

    });
}
