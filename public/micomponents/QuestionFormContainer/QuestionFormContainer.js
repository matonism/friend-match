//TODO: implement a loading icon for when email is sending
import MiCoolComponent from "../../micomponent-framework/MiCoolComponent.js";

class ContactForm extends MiCoolComponent {

    static get observedAttributes(){
        return ['message-text', 'input-error-message']
    }

    connectedCallback(){
        super.connectedCallback();
        this.questionBank = this.getQuestions();
    }

    renderedCallback(){

		let questionForm = this.shadowRoot.querySelector("question-form");
        questionForm.addEventListener("questionvalueset", event => {
            let questionIndex = this.storeResult(event);
            this.setCurrentQuestion(questionIndex + 1);
        });
        
        this.initializeQuestionForm();


    }

    getQuestions(){
        return [
            {questionId: '1111', option1: 'Feminine', option2: 'Masculine', value: 50},
            {questionId: '2222', option1: 'Good', option2: 'Evil', value: 50}
        ];
    }

    initializeQuestionForm(){
        this.setCurrentQuestion(0);
    }

    setCurrentQuestion(questionIndex){
        if(questionIndex < this.questionBank.length){
            let questionForm = this.shadowRoot.querySelector('question-form');
            questionForm.setAttribute('question-id', this.questionBank[questionIndex].questionId);
            questionForm.setAttribute('option-1', this.questionBank[questionIndex].option1);
            questionForm.setAttribute('option-2', this.questionBank[questionIndex].option2);
        }
    }

    storeResult(event){
        let questionNumber = 0;
        this.questionBank.forEach((question, index) => {
            if(question.questionId == event.detail.questionId){
                question.value = event.detail.value;
                questionNumber = index;
            }
        });
        return questionNumber;
    }



    //////////////////////////////////////////////////////////////////////////////////////////////////
    submitAnswers(){

    }

    setInput(event){
        console.log('input changed');
        this.form[event.detail.inputField] = event.detail.value;
    }

    submit(){
        this.showProcessingWall();
        let valid = this.validateSubmission();
        console.log('figure out submitting forms in nodejs and sending notification to me');
        if(valid){
            let contactForm = this;
            $.ajax({
                type: "POST",
                url : "https://adu6x55ip7.execute-api.us-east-2.amazonaws.com/contact-me-email",
                dataType: "json",
                crossDomain: "true",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(this.form),
            success: function () {
                toastr.success('Your message was sent successfully');
                contactForm.showFormCompleted();
            },
            error: function (error, textStatus) {
                // show an error message
                toastr.error('Something went wrong sending your message');
                contactForm.showError();
            }});

        }else{
            this.hideProcessingWall();
        }
        
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
    
    showError(){
        this.setAttribute('message-text', 'Sorry! There was an issue processing your request.  Feel free to reach out to me at michaelmatonis@hotmail.com or give me a call at the number listed below.');
        this.showFormCompleted();
    }
}

export default ContactForm;