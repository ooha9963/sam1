'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.lambdaHandler = async function (event, context, callback) {  
    console.log("event: ", JSON.stringify(event)); 
    const request = event['body'];
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
    console.log(event.params.path.chatbotId);
    let dbResponse = await getChatbot(params);

//return dbResponse;
    if (dbResponse.error) {
        return  callback(JSON.stringify({
            statusCode:500,
            body:"error!"
        }));
    }

    let resp = dbResponse.data.Items;
 //   return resp[0].data.componentIds;
    let componentdetails=[];
    if(resp[0].data.componentIds.length>0){
        for(let i = 0;i< resp[0].data.componentIds.length;i++){
            

            let component;
            let componentParams = {
                TableName: process.env.TableName,
                KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
                ExpressionAttributeNames: {
                  "#userID": "userID",
                  "#dataType": "dataType",
                     
                },
                ExpressionAttributeValues: {
                  ":a": "User#reframQ",
                  ":t":  "Component#"+resp[0].data.componentIds[i],
                }  
            };
            let response = await getComponent(componentParams);
            if (response.error) {
                return  callback(JSON.stringify({
                    statusCode:500,
                    body:"error!"
                }));
            }
            
       let dbresp= response.data.Items[0]

            componentdetails.push({
                id:dbresp.data.id,
                name:dbresp.data.name,
                description:dbresp.data.description,
                type:dbresp.data.type,

            });
            return {

                statusCode: 200,
                result:  componentdetails
            };

        }
    }
    
    else{
        return  callback(JSON.stringify({
            statusCode:404,
            body:"component not found!"
        }));
    }
};
 
async function getComponent(params) {

    return new Promise((resolve) => {

        dynamoDb.query(params, (error, data) => {
            resolve({ error, data });
        });

    });
}  
async function getChatbot(params) {

    return new Promise((resolve) => {

        dynamoDb.query(params, (error, data) => {
            resolve({ error, data });
        });

    });
}  