
const AWS = require('aws-sdk');
 
let bcrypt = require('bcryptjs');
//let jwt = require('jsonwebtoken');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
exports.lambdaHandler = async (event, context,callback) => {
    console.log("event: ", JSON.stringify(event));
    console.log("context: ", JSON.stringify(context));   
    const request = event['body'];
    const { v4: uuidv4 } = require('uuid');
    let userid=uuidv4();

      let encryptedPassword;

    AWS.config.update({ region: 'us-east-1' });
      let privateKey = "QMS_123#321"
    let getparams = {
        TableName: process.env.TableName,
        KeyConditionExpression: "#userID = :a and begins_with(#dataType, :t)",
        ExpressionAttributeNames: {
            "#userID": "userID",
            "#dataType": "dataType"
        },
        ExpressionAttributeValues: {
            ":a": "User#reframQ",
            ":t": "U#"+ request.email.toLowerCase()
        }
    }
    let getuser = await getUser(getparams);
    if (getuser.error) {
        return  callback(JSON.stringify({
            statusCode:500,
            message:"error!"
        }));
    }
    if (getuser.data && !getuser.data.Items[0]) {
        encryptedPassword = await hashPassword(request);
        const user = {
            id: userid ,
            firstName: request.firstName,
            lastName: request.lastName,
            email: request.email,
            active: false,
        };
//        user.admin = request.isAdmin ? 'admin' : 'staff';
        user.encryptedPassword = encryptedPassword;
        user.passwordSet = false;
        const params = {
            TableName: process.env.TableName,
            Item : {
              userID: "User#reframQ",
              dataType: "U#"+ request.email.toLowerCase(),
              data:user
            }
        };
        let { data, error } = await createUser(params)
        if (error) {
            return  callback(JSON.stringify({
                statusCode:500,
                message:"error"
            }));
        }          
       return {
            statusCode: 200,
           message: 'Account Created Successfully!',
           
       };
   }
   else {
       return {
           statusCode: 400,
         message: 'User Already Exists!!'
       }
   }
};

async function createUser(params) {

    return new Promise((resolve) => {

        dynamoDb.put(params, function (error, data) {

            console.log("In dynamoDB.put response: ", error, data);
            resolve({ error, data });
        });
    });
}

async function hashPassword(request) {

    const password = request.password
    const saltRounds = 10;

    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) return (err)
            resolve(hash)
        });
    })

    return hashedPassword
}

async function getUser(params) {
   return new Promise((resolve) => {
       dynamoDb.query(params, (error, data) => {
           resolve({ error, data });
      });
    });
}