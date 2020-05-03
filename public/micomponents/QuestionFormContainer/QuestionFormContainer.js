//TODO: implement a loading icon for when email is sending
import MiCoolComponent from "../../micomponent-framework/MiCoolComponent.js";

class QuestionFormContainer extends MiCoolComponent {

    static get observedAttributes(){
        return ['message-text', 'input-error-message', 'question-count', 'current-question']
    }

    connectedCallback(){
        super.connectedCallback();
        this.questionIndex = 0;
        this.selectedQuiz = '';
    }

    renderedCallback(){
        let startOverButton = this.shadowRoot.querySelectorAll(".start-over-button");
        startOverButton[0].addEventListener('click', event => {
            this.showProcessingWall();
            setTimeout(() => {
                location.reload();
            }, 1000)
        });

        startOverButton[1].addEventListener('click', event => {
            this.showProcessingWall();
            setTimeout(() => {
                location.reload();
            }, 1000)
        });

        let questionForm = this.shadowRoot.querySelector("question-form");
        let quizSelector = this.shadowRoot.querySelector("quiz-selector");
        
        questionForm.addEventListener("questionvalueset", event => {
            this.storeResult(event);
        });

        questionForm.addEventListener("next", event => {
            this.setCurrentQuestion(++this.questionIndex);
        });

        questionForm.addEventListener("previous", event => {
            if(this.questionIndex > 0){
                this.setCurrentQuestion(--this.questionIndex);
            }
        });
        
        quizSelector.addEventListener("quizselected", event => {
            this.selectedQuiz = event.detail;
            this.getQuestions().then(() => {
                this.shadowRoot.querySelector('.start-over-button.mobile').classList.remove('hide');
                quizSelector.classList.add('hide');
                this.initializeQuestionForm();
                questionForm.classList.remove('hide');
            });
        });


    }

    getQuestions(){
        return new Promise((resolve, reject)=> {
            
            this.showProcessingWall();
            let valid = true;

            if(valid){
                let questionFormContainer = this;
                let quizSelector = this.shadowRoot.querySelector('quiz-selector');
                try{
                    $.ajax({
                        type: "GET",
                        url : "https://2l19p5fcf2.execute-api.us-east-2.amazonaws.com/getSurveyQuestions?quiz=" + this.selectedQuiz,
                        // url : "http://localhost:3000/getSurveyQuestions?quiz=" + this.selectedQuiz,
                        dataType: "json",
                        crossDomain: "true",
                        contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        //console.log(data);
                        questionFormContainer.questionBank = data;
                        questionFormContainer.hideProcessingWall();
                        resolve(data);
                    },
                    error: function (error, textStatus) {
                        // show an error message
                        quizSelector.showError(error.responseText);
                        questionFormContainer.hideProcessingWall();
                        reject(error);
                    }});
                }catch(error){
                    console.log(error);
                    reject(error)
                }
    
            }else{
                this.hideProcessingWall();
                reject();
            }
            // return [
            //     {questionId: '1', option1: 'Feminine', option2: 'Masculine', value: 50},
            //     {questionId: '2', option1: 'Good', option2: 'Evil', value: 50}
            // ];

        });
    }

    initializeQuestionForm(){
        
        this.setAttribute('question-count', this.questionBank.length);
        this.setCurrentQuestion(this.questionIndex);
    }

    setCurrentQuestion(questionIndex){
        if(questionIndex < this.questionBank.length && questionIndex >= 0){
            let questionForm = this.shadowRoot.querySelector('question-form');
            this.setAttribute('current-question', questionIndex + 1);
            questionForm.setAttribute('question-header', 'Question ' + this.getAttribute('current-question') + '/' + this.getAttribute('question-count'));
            questionForm.setAttribute('question-id', this.questionBank[questionIndex].questionid);
            questionForm.setAttribute('option-1', this.questionBank[questionIndex].option1);
            questionForm.setAttribute('option-2', this.questionBank[questionIndex].option2);
            questionForm.setAttribute('option-1-percentage', 100 - this.questionBank[questionIndex].value + '%');
            questionForm.setAttribute('option-2-percentage', this.questionBank[questionIndex].value + '%');
            questionForm.setAttribute('question-value', this.questionBank[questionIndex].value);
        }else if(questionIndex == this.questionBank.length){
            this.submitAnswers();
        }

    }

    storeResult(event){
        let questionNumber = 0;
        this.questionBank.forEach((question, index) => {
            if(question['questionid'.toLowerCase()] == event.detail.questionId){
                question.value = event.detail.value;
                questionNumber = index;
            }
        });
        return questionNumber;
    }

    submitAnswers(){
        this.showProcessingWall();
        let valid = true;
        if(valid){
            let questionFormContainer = this;
            $.ajax({
                type: "POST",
                // url : "http://localhost:3000/getSurveyResults?quiz=" + this.selectedQuiz,
                url : "https://2l19p5fcf2.execute-api.us-east-2.amazonaws.com/getSurveyResults?quiz=" + this.selectedQuiz,
                dataType: "json",
                crossDomain: "true",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(this.questionBank),
            success: function (data) {
                //console.log(data);
                let surveyResultsElement = questionFormContainer.shadowRoot.querySelector('survey-results');
                surveyResultsElement.results = data;
                surveyResultsElement.classList.remove('hide');
                surveyResultsElement.showResults();
                questionFormContainer.shadowRoot.querySelector('question-form').classList.add('hide');
                questionFormContainer.hideProcessingWall();
            },
            error: function (error, textStatus) {
                questionFormContainer.showError(error.responseText);
                questionFormContainer.hideProcessingWall();
            }});

        }else{
            this.hideProcessingWall();
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////


    setInput(event){
        //console.log('input changed');
        this.form[event.detail.inputField] = event.detail.value;
    }

    submit(){
        
        
    }

    validateSubmission(){
        let validInput = true;
        let name = this.form.name;
        let email = this.form.email;
        let content = this.form.content;
        let inputErrors = {
            name: {selector: "custom-input#name", message: ''},
            email: {selector: "custom-input#email", message: ''},
            content: {selector: "custom-input#content", message: ''}
        };

        if(!name){
            inputErrors.name.message = 'You must populate the name field';
        }else if(name && name.length <= 1){
            inputErrors.name.message = 'You must populate a real name';
        }else{
            inputErrors.name.message = '';;
        }

        if(!email){
            inputErrors.email.message = 'You must populate the email field';
        }else if(email && (!email.includes('@') || !email.includes('.') || email.length <= 4)){
            inputErrors.email.message = 'You must populate a real email field';
        }else{
            inputErrors.email.message = '';
        }

        if(!content){
            inputErrors.content.message = 'You must include a message';
        }else{
            inputErrors.content.message = '';
        }

        let errorMessage = 'Please correct the following errors:';
        Object.keys(inputErrors).forEach((input) => {
            if(inputErrors[input].message){
                errorMessage += '\n' + inputErrors[input].message;
                this.showInputError(inputErrors[input].selector);
                validInput = false;
            }else{
                this.removeInputError(inputErrors[input].selector);
            }
        })

        if(!validInput){
            this.shadowRoot.querySelector('.input-error-message').classList.remove('hide');
            this.setAttribute('input-error-message', errorMessage);
        }

        return validInput;
    }

    showInputError(selector){
        let inputField = this.shadowRoot.querySelector(selector);
        inputField.setAttribute('error', true);
    }

    removeInputError(selector){
        let inputField = this.shadowRoot.querySelector(selector);
        inputField.setAttribute('error', false);
    }

    showProcessingWall(){
        this.shadowRoot.querySelector('.processing-wall').classList.remove('hide');
    }

    hideProcessingWall(){
        this.shadowRoot.querySelector('.processing-wall').classList.add('hide');
    }

    showFormCompleted(){
        this.shadowRoot.querySelector('.contact-form-format').classList.add('hide');
        this.shadowRoot.querySelector('.form-completed').classList.remove('hide');
        this.hideProcessingWall();
    }
    
    showError(errorMessage){
        let message = "Sorry! There was an issue processing your request.  Feel free to reach out to me at michaelmatonis@hotmail.com or give me a call at the number listed below.Sorry! There was an issue processing your request.  Feel free to reach out to me at michaelmatonis@hotmail.com or give me a call at the number listed below.";
        if(errorMessage){
            message = errorMessage;
        }
        this.setAttribute('input-error-message', message);
    }
}

export default QuestionFormContainer;