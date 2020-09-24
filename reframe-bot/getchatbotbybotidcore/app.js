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
          "#dataType": "dataType",
             
        },
        ExpressionAttributeValues: {
          ":a": "User#reframQ",
          ":t":  "Chatbot#"+event.params.path.chatbotId
        }  
    };
    console.log(event.params.path.chatbotid);
    let dbResponse = await getChatbot(params);

    if (dbResponse.error) {
        return  callback(JSON.stringify({
            statusCode:500,
            body:"error!"
        }));
    }

    let botList = [] ;
    let resp = dbResponse.data.Items;
 
    if(dbResponse.data.Items[0]){

        botList.push({ 
            status:resp[0].data.status,
            id:resp[0].data.id,
            name:resp[0].data.name,
            description:resp[0].data.description,
            welcomeMesasge:resp[0].data.welcomeMesasge,
            componentsList:resp[0].data.componentIds,
            config:resp[0].data.config


  
           });
        

        return {

        statusCode: 200,
        result: botList
        
    };
}
    else{
        return  callback(JSON.stringify({
            statusCode:404,
            body:"Chatbot not found!"
        }));
    }
    
};


async function getChatbot(params) {

    return new Promise((resolve) => {

        dynamoDb.query(params, (error, data) => {
            resolve({ error, data });
        });

    });
}   