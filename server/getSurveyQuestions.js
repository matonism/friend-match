// dependencies
const AWS = require('aws-sdk');
const xlsx = require('node-xlsx');
// get reference to S3 client
const s3 = new AWS.S3({ accessKeyId: 'AKIAIRGU23KGR6LNZHYA', secretAccessKey: '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' });

function getSurveyQuestions(){
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


module.exports = getSurveyQuestions;