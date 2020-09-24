'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.lambdaHandler = async function (event, context, callback) {  
    console.log("event: ", JSON.stringify(event)); 
    const request = event['body'];
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
          ":t":  "Component#"+event.params.path.componentid,
        }  
    };
    let response = await getComponent(componentParams);
    if (response.error) {
        return {
            statusCode: 500,
            body: response.error
        };
    }
    response= response.data.Items[0];
 
    if(response.data.type=="faq"){
    
       component={
        id:response.data.id,
        name:response.data.name,
        description:response.data.description,
        type:response.data.type,
    }
    } else{
       
      component= { 
    
        id:response.data.id,
        type:response.data.type,
        name:response.data.name,
        description:response.data.description,
        startNodeId:response.data.startNodeId,
        utterances: response.data.utterances,
        topics:response.data.topics,
        tags:response.data.tags,
        sourceUrl:response.data.sourceUrl
  }
  
}
   
let params = {
                TableName: process.env.TableName,
                KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
                ExpressionAttributeNames: {
                "#userID": "userID",
                "#dataType": "dataType",
                    
                },
                ExpressionAttributeValues: {
                ":a": "Component#"+event.params.path.componentid,
                ":t":  "Node#"
                } 
        
        };

   let dbResponse = await getComponentNodes(params);
   let componentNodes =[];
   if (dbResponse.error) {
    return  callback(JSON.stringify({
        statusCode:500,
        body:"error!"
    }));
}
        for(let i = 0;i< dbResponse.data.Items.length;i++){
               let componentNode =  dbResponse.data.Items[i].data;
                componentNodes.push({
               componentNode
                  });
          }

       
        let  comp =component.type == 'faq' ?{
                        id:component.id,
                        name:component.name,
                        description:component.description,
                        type:component.type,
                        faqList:componentNodes,
        } :
    
        {
            id:component.id,
            name:component.name,
            description:component.description,
            type:component.type,
            startNodeId:component.startNodeId,
            utterances:component.utterances,
            topics:component.topics,
            tags:component.tags,
            sourceUrl:component.sourceUrl,
            decisionTree:componentNodes
       } ;
       return {

        statusCode: 200,
        result: comp
    };

  
};

async function getComponentNodes(params) {

    return new Promise((resolve) => {

        dynamoDb.query(params, (error, data) => {
            resolve({ error, data });
        });

    });
}  
async function getComponent(params) {

    return new Promise((resolve) => {

        dynamoDb.query(params, (error, data) => {
            resolve({ error, data });
        });

    });
}  