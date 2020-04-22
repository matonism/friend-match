import MiCoolComponent from "../../micomponent-framework/MiCoolComponent.js";

class ContactForm extends MiCoolComponent {

    static get observedAttributes(){
        return ['question-id', 'option-1', 'option-2']
    }

    connectedCallback(){
        super.connectedCallback();
        this.questionValue = 50;
    }

    renderedCallback(){

        let nextButton = this.shadowRoot.querySelector('.submit-button');
        nextButton.addEventListener('click', (event) => {
            this.saveQuestionValue(event)
        });

        let input = this.shadowRoot.querySelector('custom-input#value');
        input.addEventListener('custominputkeyup', (event) => {
            this.questionValue = event.detail.value;
        });

    }

    saveQuestionValue(event){
        let isValid = this.validateNumber();

        if(isValid){
            let questionEvent = new CustomEvent('questionvalueset', {
                detail: {
                    'questionId': this.getAttribute('question-id').toString(),
                    'value': this.questionValue
                }
            });

            this.dispatchEvent(questionEvent);
            this.questionValue = 50;
        }else{
            this.showInputError('custom-input#value');
        }
    }


    validateNumber(){
        return true;
    }

/////////////////////////////////////////////////////////////////////////////////////
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