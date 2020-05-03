function getBucketFileForQuiz(quizString){
    let bucketFile = null;

    if(quizString.toLowerCase() == '167house'){
        bucketFile = '167QuizBank.xlsx';
    }else if(quizString.toLowerCase() == 'clevelandfriends'){
        bucketFile = 'ClevelandFriendsQuizBank.xlsx';
    }else if(quizString.toLowerCase() == 'matonis12'){
        bucketFile = 'MatonisQuizBank.xlsx';   
    }else if(quizString.toLowerCase() == 'fullquiz'){
        bucketFile = 'FullQuizBank.xlsx';
    }else if(quizString.toLowerCase() == 'beauandrowdy'){
        bucketFile = 'MassaQuizBank.xlsx';
    }else if(quizString.toLowerCase() == 'thekuchisin'){
        bucketFile = 'ClevelandMillenialsQuizBank.xlsx';
    }else if(quizString.toLowerCase() == 'michaelandtherest'){
        bucketFile = 'MatonisKidsQuizBank.xlsx';
    }else if(quizString.toLowerCase() == 'ktrainofthought'){
        bucketFile = 'KennyAnswerQuizBank.xlsx';
    }

    return bucketFile;
}

module.exports = getBucketFileForQuiz;