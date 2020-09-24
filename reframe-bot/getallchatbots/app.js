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
          ":t":  "Chatbot#"
        }
          
    }; 
    
    let dbResponse = await getChatbot(params);
    
 
    let chatbotList = [];

    for(let i=0;i<dbResponse.data.Items.length;i++)

    {
     
        chatbotList.push({
        status:dbResponse.data.Items[i].data.status,
        id:dbResponse.data.Items[i].data.id,
        name: dbResponse.data.Items[i].data.name,
        totalComponents: dbResponse.data.Items[i].data.componentIds,
        Users:dbResponse.data.Items[i].data.users,


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
    result: chatbotList
    };
}
async function getChatbot(params) {

    return new Promise((resolve) => {

        dynamoDb.query(params, (error, data) => {
            resolve({ error, data });
        });

    });
}  