const AWS = require('aws-sdk');
   
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
exports.lambdaHandler = async (event, context, callback) => {
  const request = event['body'];
console.log("event: ", JSON.stringify(event));
  let privateKey = "QMS_123#321"
  if(event['body']!= undefined ||event['body']!={}){


    let params = {
    TableName: process.env.TableName,
    KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
    ExpressionAttributeNames: {
      "#userID": "userID",
      "#dataType": "dataType"
    },
    ExpressionAttributeValues: {
      ":a": `User#reframQ`,
      ":t":  "U#"+request.username.toLowerCase()
    }  
  }
    let{data, error}  = await getUser(params);
    if(error) {
      return  callback(JSON.stringify({
        statusCode:500,
        message:"error"
    }));
    }
  
    // condition to check complete email to avoid begins with bug
    const completeEmail = (data.Items[0] && data.Items[0].dataType && data.Items[0].dataType.split('#')[1]);
    if(!completeEmail) {
      return  callback(JSON.stringify({
            statusCode:404,
            body:"User not found!"
        }));
    }
    if(completeEmail.toLowerCase()!= request.username.toLowerCase()) {
      return  callback(JSON.stringify({
            statusCode:404,
            body:"User not found!"
        }));
    }
    if(data && data.Items[0] && data.Items[0].data) {
    let {firstName, lastName, encryptedPassword, username, active, id} = data.Items[0].data;
    let user = { firstName, lastName, username, active, id, };
    
  //check password
    let isPasswordCorrect = await unHashPassword(request.password, encryptedPassword);
    console.log(isPasswordCorrect);
      if(!isPasswordCorrect.data) {
        return  callback(JSON.stringify({
          statusCode:404,
          message:"Wrong Password, Try Again !!!"
      }));
    }
      if(isPasswordCorrect.data)  {
          let jwtToken = jwt.sign(user, privateKey);
          return {
          statusCode: 200,
          result: {
          message:'Logged in Successfully!',
          token: jwtToken,
          firstName: user.firstName,
          lastName: user.lastName,
          }
          };
      }
    }
    else {
      return  callback(JSON.stringify({
            statusCode:404,
            body:"User not found!"
        }));
    }
  }
  else{
      return  callback(JSON.stringify({
            statusCode:404,
            body:"User not found!"
        }));
  }   
};

async function getUser(params) {
  return new Promise((resolve) => {
    dynamoDb.query(params, (error, data) => {
      resolve({ error, data });
    });
  });
}

async function unHashPassword (password, encryptedPassword) {
  
  return new Promise((resolve) => {
    bcrypt.compare(password, encryptedPassword, function(err, hash) {
      if(err)  return(err);
      resolve({ data: hash });
    });
  })
}