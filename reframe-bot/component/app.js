
'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
exports.lambdaHandler = async function (event, context, callback) {

    console.log("event: ", JSON.stringify(event));
    const request = event['body'];
    const { v4: uuidv4 } = require('uuid');
    let componentid = uuidv4();
    let currentDate = new Date().toISOString();
    let componentData;

    if (request.type == "faq") {
        componentData = {
            id: componentid,
            name: request.name,
            description: request.description,
            type: request.type
        }
    }
    else {
        componentData = {
            id: componentid,
            type: request.type,
            name: request.name,
            description: request.description,
            startNodeId: request.startNodeId,
            utterances: request.utterances,
            topics: request.topics,
            tags: request.tags,
            sourceUrl: request.sourceUrl
        }

    }
    const params = {
        TableName: process.env.TableName,
        Item: {
            userID: "User#reframQ",
            dataType: "Component#" + componentid,
            data: componentData,
            createdBy: request.username,
            modifiedBy: request.username,
            createdAt: currentDate,
            modifiedAt: currentDate
        }
    };

    let { data, error } = await createComponent(params)
    if (error) {
        return  callback(JSON.stringify({
            statusCode:500,
            message:error
        }));
    }

    let componentList = request.type == "faq" ? request.faqList : request.decisionTree;
    for (let i = 0; i < componentList.length; i++) {

        let component = componentList[i]

        component.id = request.type == "faq" ? componentid + i : component.id;
        const componentParams = {
            TableName: process.env.TableName,
            Item: {
                userID: "Component#" + componentid,
                dataType: "Node#" + component.id,
                data: component,

            }

        }
        let componentResponse = await createComponent(componentParams)
        console.log("componentResp", componentParams);
        if (componentResponse.error) {
            return  callback(JSON.stringify({
                statusCode:500,
                body:componentResponse.error
            }));
        }

    };
    return {
        statusCode: 200,
        message: "component created successfully",
        componentid: componentid
    }
}

async function createComponent(params) {

    return new Promise((resolve) => {

        dynamoDb.put(params, function (error, data) {

            console.log("In dynamoDB.put response: ", error, data);
            resolve({ error, data });
        });
    });
}