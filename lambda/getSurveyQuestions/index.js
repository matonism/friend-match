// dependencies
const AWS = require('aws-sdk');
const xlsx = require('node-xlsx');
const getBucketFileForQuiz = require('./getBucketFileForQuiz.js');
// get reference to S3 client
const s3 = new AWS.S3({ accessKeyId: process.env.accesskey, secretAccessKey: process.env.privatekey });

exports.handler = async (event) => {
    console.log(event);
    return getSurveyQuestions(event.queryStringParameters).then(surveyQuestions => {
        // TODO implement
        const response = {
            statusCode: 200,
            body: JSON.stringify(surveyQuestions),
        };
        return response;
    }).catch(error => {
        const response = {
            statusCode: 400,
            body: error
        }
        return response
    });
};

function getSurveyQuestions(queryParams){
    return new Promise((resolve, reject) => {
        try{
            let bucketFileName = getBucketFileForQuiz(queryParams.quiz);
            if(bucketFileName == null){
                throw ('There is no data set for that code');
            }
            var params = {
                Bucket: "friend-survey",
                Key: bucketFileName
            };
        
            var file = s3.getObject(params).createReadStream();
            var buffers = [];
        
            file.on('data', function (data) {
                buffers.push(data);
            });
        
            file.on('end', function () {
                var buffer = Buffer.concat(buffers);
                var workbook = xlsx.parse(buffer);
                // console.log("workbook", workbook);
                let convertedSpreadsheet = createObjectsFromArrays(workbook[0].data);
                resolve(convertedSpreadsheet);
            });
        }catch(error){
            reject(error)
        }
    
        // return [
        //     {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 50},
        //     {questionId: '2', option1: 'Good', option2: 'Evil', value: 50}
        // ];

    });
}

function createObjectsFromArrays(worksheetData){
    let convertedSpreadsheet = [];
    let headerRow = worksheetData[0];
    for(i = 1; i < worksheetData.length; i++){
        let rowObject = {};
        let currentRow = worksheetData[i];
        headerRow.forEach((columnHeader, index) => {
            rowObject[columnHeader.toLowerCase()] = currentRow[index];
        });
        convertedSpreadsheet.push(rowObject);
    }

    return convertedSpreadsheet;
}
