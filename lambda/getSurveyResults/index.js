
// dependencies
const AWS = require('aws-sdk');
const xlsx = require('node-xlsx');
const getBucketFileForQuiz = require('./getBucketFileForQuiz.js');

const s3 = new AWS.S3({ accessKeyId: process.env.accesskey, secretAccessKey: process.env.privatekey });

exports.handler = async (event) => {
    return getSurveyResults(event.queryStringParameters, JSON.parse(event.body)).then(surveyResults => {
        console.log('surveyResults', surveyResults);
        // TODO implement
        const response = {
            statusCode: 200,
            body: JSON.stringify(surveyResults),
        };
        return response;

    }).catch(error => {
        const response = {
            statusCode: 400,
            body: error
        }
        return response
    });;
};

function getSurveyResults(queryParams, questionBank){

    return getPossibleResults(queryParams).then(possibleResults => {
         return getSimpleDiffResults(possibleResults, questionBank);
         //return getStandardDeviationResults(possibleResults, questionBank);
     }).catch(error => {
         return {
             status: 400,
             error: error
         };
     });
     
 }
 
 function getSimpleDiffResults(possibleResults, questionBank){
 
     let scoreMap = [];
     
     //for each possible match (Richie, Michael, Austin, etc....)
     Object.keys(possibleResults).forEach(personIndex => {
 
         //for each question answered
         questionBank.forEach((submission, index) => {
             
             let matchingQuestion = possibleResults[personIndex].questions.find((question) => {
                 return question.questionid == submission.questionid;
             });
             
             let answerDiff = Math.abs(parseInt(matchingQuestion.value) - parseInt(submission.value));
             possibleResults[personIndex].diff += answerDiff;       
 
             if(index == questionBank.length - 1){
                 let rawScore = (1 - (possibleResults[personIndex].diff / (questionBank.length * 50))) * 100;
                 if(rawScore < 0){
                     rawScore = 0;
                 }
                 possibleResults[personIndex].score = parseFloat(rawScore.toFixed(2));
                 scoreMap.push({name: personIndex, score: possibleResults[personIndex].score});
             }
         });
     });
 
     scoreMap = scoreMap.sort((a, b) => {
         return b.score - a.score;
     })
     return scoreMap;
 }
 
 function getStandardDeviationResults(possibleResults, questionBank){
     let personAverages = {};
     let answerArray = [];
     let scoreMap = [];
     //for each person, form a value array
     Object.keys(possibleResults).forEach(personIndex => {
         averageArray = [];
         possibleResults[personIndex].questions.forEach(question => {
             averageArray.push(question.value / 50 - 1);
         });
         personAverages[personIndex] = averageArray;
     })
     //form a value array for the submitted answers
     questionBank.forEach((question) => {
         answerArray.push(question.value / 50 - 1);
     })
 
     //for each person's value array, calculate correlation
 
     let xArray = answerArray.slice();
     xArray.fill(0);
 
     
     Object.keys(possibleResults).forEach(personIndex => {  
         let correlation = getStandardDeviation(xArray, answerArray, xArray, personAverages[personIndex]);
         // let adjustedCorrelation = (correlation + 1) * 50;
         scoreMap.push({name: personIndex, score: correlation});
     });
     
 
     scoreMap = scoreMap.sort((a, b) => {
         return b.score - a.score;
     });
     return scoreMap;
 }
 
 function getStandardDeviation(x, y, xAverage, yAverage) {
     var shortestArrayLength = 0;
 
     if(x.length == y.length) {
         shortestArrayLength = x.length;
     } else if(x.length > y.length) {
         shortestArrayLength = y.length;
         console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
     } else {
         shortestArrayLength = x.length;
         console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
     }
 
     //get sum of y differences
     let sumOfSquaredYDifferences = 0;
     for(var i=0; i<shortestArrayLength; i++) {
         let diffFromAverage = y[i] - yAverage[i];
         let squaredDiff = Math.pow(diffFromAverage, 2);
         sumOfSquaredYDifferences += squaredDiff;
     }
 
     let yStandardDev = Math.sqrt(sumOfSquaredYDifferences / (shortestArrayLength - 1));
     console.log(yStandardDev);
     
     //with conversion to -1 - 1 range
     //me test - max of 40-20
     //50 test - max of 29-20
     //100 test - -0.1 - -6.0
     // let finalAnswer = 100 - ((yStandardDev + 1) * 50);
 
     //with conversion to -1 - 1 range
     //me test - max of 78-22
     //50 test - max of 29 span of 10
     //100 test - -1 - -13
 
     //this 1 decides the cutoff point.  If the standard deviation's range is 2 (determined by possible values -1 to 1), then if you are 50% away from me, you are nothing like me
     let finalAnswer = (1 - yStandardDev) * 100;
     if(finalAnswer < 0){
         finalAnswer = 0;
     }
     return parseFloat(finalAnswer.toFixed(2));
 
 }
 
 
 function getPossibleResults(queryParams){
     return new Promise((resolve, reject) => {
         try{
             let bucketFileName = getBucketFileForQuiz(queryParams.quiz);
             if(bucketFileName == null){
                 reject('There is no data set for that code');
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
                 console.log("workbook", workbook);
 
                 let answerBank = {};
                 //loop through all the worksheets
                 // console.log(workbook.length);
                 for(let i = 1; i < workbook.length; i++){
                     let currentWorksheet = workbook[i];
                     let currentPerson = currentWorksheet.name;
                     console.log(currentPerson);
                     answerBank[currentPerson] = {};
                     answerBank[currentPerson].questions = createObjectsFromArrays(workbook[i].data);
                     answerBank[currentPerson].diff = 0;
                 }
                 //console.log(answerBank);
                 resolve(answerBank);
             });
         }catch(error){
             console.log(error);
             reject(error)
         }
         // return {
         //     Richie: {diff: 0, questions: [
         //         {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 100},
         //         {questionId: '2', option1: 'Good', option2: 'Evil', value: 40}
         //     ]},
         //     Michael: {diff: 0, questions: [
         //         {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 60},
         //         {questionId: '2', option1: 'Good', option2: 'Evil', value: 20}
         //     ]},
         //     Austin: {diff: 0, questions: [
         //         {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 55},
         //         {questionId: '2', option1: 'Good', option2: 'Evil', value: 50}
         //     ]},
         //     Nick: {diff: 0, questions: [
         //         {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 60},
         //         {questionId: '2', option1: 'Good', option2: 'Evil', value: 40}
         //     ]},
         //     Dan: {diff: 0, questions: [
         //         {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 75},
         //         {questionId: '2', option1: 'Good', option2: 'Evil', value: 10}
         //     ]},
         //     Ryan: {diff: 0, questions: [
         //         {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 80},
         //         {questionId: '2', option1: 'Good', option2: 'Evil', value: 65}
         //     ]}
         // }
         
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
 