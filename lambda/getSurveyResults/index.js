// dependencies
const AWS = require('aws-sdk');
const xlsx = require('node-xlsx');
// get reference to S3 client
const s3 = new AWS.S3({ accessKeyId: process.env.accesskey, secretAccessKey: process.env.privatekey });

exports.handler = async (event) => {
    return getSurveyResults(JSON.parse(event.body)).then(surveyResults => {
        console.log('surveyResults', surveyResults);
        // TODO implement
        const response = {
            statusCode: 200,
            body: JSON.stringify(surveyResults),
        };
        return response;

    });
};
function getSurveyResults(questionBank){
    return getPossibleResults().then(possibleResults => {
        // return getSimpleDiffResults(possibleResults, questionBank);
        return getStandardDeviationResults(possibleResults, questionBank);
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
                let rawScore = (1 - (possibleResults[personIndex].diff / (questionBank.length * 100))) * 100;
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
    let finalAnswer = (1 - yStandardDev) * 100;
    return parseFloat(finalAnswer.toFixed(2));

}


function getPossibleResults(){
    return new Promise((resolve, reject) => {
        try{
            var params = {
                Bucket: "friend-survey",
                Key: "SurveyAnswers.xlsx"
            };
        
            var file = s3.getObject(params).createReadStream();
            var buffers = [];
        
            file.on('data', function (data) {
                buffers.push(data);
            });
        
            file.on('end', function () {
                var buffer = Buffer.concat(buffers);
                var workbook = xlsx.parse(buffer);
                //console.log("workbook", workbook);

                let answerBank = {};
                //loop through all the worksheets
                // console.log(workbook.length);
                for(let i = 1; i < workbook.length; i++){
                    let currentWorksheet = workbook[i];
                    let currentPerson = currentWorksheet.name;
                    //console.log(currentPerson);
                    answerBank[currentPerson] = {};
                    answerBank[currentPerson].questions = createObjectsFromArrays(workbook[i].data);
                    answerBank[currentPerson].diff = 0;
                }
                console.log(answerBank);
                resolve(answerBank);
            });
        }catch(error){
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