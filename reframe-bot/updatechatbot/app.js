'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.lambdaHandler = async function (event, context, callback) {
  
    const request = event['body'];
    let currentDate = new Date().toISOString();
if(request != undefined || request != {} )
{
    let chatbot = {
        name : request.name,
        description:request.description,
        welcomeMesasge:request.welcomeMesasge,
        username:request.username,
        componentIds:request.componentIds
    }
     let updateParams ={
        
        TableName:  process.env.TableName,
        Key: {
                userID: "User#reframQ",
                dataType: "Chatbot#"+request.params.path.chatbotId, 
        },
        ExpressionAttributeNames: {
            "#data": "data",
            "#chatbotIds": "chatbots",
        },
        UpdateExpression: "set #data=:chatbotObject",
        ExpressionAttributeValues: {
          ":chatbotObject":chatbot,
        },
    
            ReturnValues: "UPDATED_NEW"
    };
     
    let updateResponse = await updateChatbot(updateParams);
    if(updateResponse.error){
        return  callback(JSON.stringify({
            statusCode:500,
            body:"Chatbot update failed"
        }));
    }
 
    return {

        statusCode: 200,
        body:"bot updated successfully ",
        chatbotid
    };
}
};

async function updateChatbot(params) {

    return new Promise((resolve) => {

        dynamoDb.update(params, function (error, data) {

            console.log("In dynamoDB.put response: ", error, data);
            resolve({ error, data });
        });
    });
}
    

