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
          ":t":  "Component#"+request.id,
        }  
    };
    let response = await getComponent(componentParams);
    if (response.error) {
        return  callback(JSON.stringify({
            statusCode:500,
            body:"error!"
        }));
    }
    response= response.data.Items[0];
  
  

    if(request.type=="faq"){
    
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
   

 if(request.type == "faq"){
 
    if(request.LastEvaluatedKey == null){
            let params = {
                TableName: process.env.TableName,
                KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
                ExpressionAttributeNames: {
                "#userID": "userID",
                "#dataType": "dataType",
                    
                },
                Limit:request.limit,
                
                ExpressionAttributeValues: {
                ":a": "Component#"+request.id,
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
        let component =dbResponse.data.Items[i].data;
        componentNodes.push({
             component
        });
      }
       
        let  comp ={
                        id:component.id,
                        name:component.name,
                        description:component.description,
                        type:component.type,
                        faqList:componentNodes,
                        LastEvaluatedKey:dbResponse.data.LastEvaluatedKey
        } 
    
        return {

            statusCode: 200,
            result: comp
        };
    }else{
        let params = {
            TableName: process.env.TableName,
            KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
            ExpressionAttributeNames: {
            "#userID": "userID",
            "#dataType": "dataType",
                
            },
            Limit:request.limit,
            ExclusiveStartKey:request.LastEvaluatedKey,
            ExpressionAttributeValues: {
            ":a": "Component#"+request.id,
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
        let component =dbResponse.data.Items[i].data;
        componentNodes.push({
             component
        });
      }
        let  comp ={
                        id:component.id,
                        name:component.name,
                        description:component.description,
                        type:component.type,
                        faqList:componentNodes,
            LastEvaluatedKey:dbResponse.data.LastEvaluatedKey
          
        } 
    
        return {

            statusCode: 200,
            result: comp
        };
}
}else{
    let params = {
        TableName: process.env.TableName,
        KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
        ExpressionAttributeNames: {
          "#userID": "userID",
          "#dataType": "dataType",
             
        },
        ExpressionAttributeValues: {
          ":a": "Component#"+request.id,
          ":t":  "Node#"
        }  
    };
    
    let dbResponse = await getComponentNodes(params);

   let componentNodes = [];
   for(let i = 0;i< dbResponse.data.Items.length;i++){
    let component =dbResponse.data.Items[i].data;
    componentNodes.push({
         component
    });
  }
    
        let  comp ={
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
       } 


    return {

        statusCode: 200,
        result: comp
    };
}
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