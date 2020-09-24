'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.lambdaHandler = async function (event, context, callback) {
  
    const { v4: uuidv4 } = require('uuid');
    let chatbotid=uuidv4();
    console.log("event: ", JSON.stringify(event));
    const request = event['body'];
    let currentDate = new Date().toISOString();
     let chatbot={
         id:chatbotid,
         status: request.status,
         name: request.name,
         description: request.description,
         welcomeMesasge:  request.welcomeMesasge,
         users:  0,
         componentIds :request.componentIds,
         config: request.config,
        

     }
    let params = {
        TableName: process.env.TableName,
        Item : {
            userID: "User#reframQ",
            dataType: "Chatbot#"+chatbotid,          
            data:chatbot,
            createdBy:request.username,
            modifiedBy:request.username,
            createdAt:currentDate,
            modifiedAt:currentDate
        }
    };

    let dbResponse = await createChatbot(params);
    if (dbResponse.error) {

        return  callback(JSON.stringify({
            statusCode:500,
            body:dbResponse.error
        }));
    }
    for(let i=0;i<request.componentIds.length;i++){
        
     let updateParams ={
        
        TableName:  process.env.TableName,
        Key: {
                userID: "User#reframQ",
                dataType: "Component#"+request.componentIds[i], 
        },
        ExpressionAttributeNames: {
            "#data": "data",
            "#chatbotIds": "chatbots",
        },
        UpdateExpression: "set #data.#chatbotIds=list_append(if_not_exists(#data.#chatbotIds, :empty_list),:chatbots)",
        ExpressionAttributeValues: {
          ":chatbots":[chatbotid],
            ":empty_list":[]
        },
    
            ReturnValues: "UPDATED_NEW"
    };
     
    let updateResponse = await updateComponent(updateParams);
    if(updateResponse.error){
        return  callback(JSON.stringify({
            statusCode:500,
            body:updateResponse.error
        }));
    }
    };
 
    return {

        statusCode: 200,
        body:"successfully created bot ",
        chatbotid
    };

};

async function createChatbot(params) {

    return new Promise((resolve) => {

        dynamoDb.put(params, function (error, data) {

            console.log("In dynamoDB.put response: ", error, data);
            resolve({ error, data });
        });
    });
}
async function updateComponent(params) {

    return new Promise((resolve) => {

        dynamoDb.update(params, function (error, data) {

            console.log("In dynamoDB.put response: ", error, data);
            resolve({ error, data });
        });
    });
}
    

