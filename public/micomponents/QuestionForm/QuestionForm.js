import MiCoolComponent from "../../micomponent-framework/MiCoolComponent.js";

class QuestionForm extends MiCoolComponent {

    static get observedAttributes(){
        return ['question-id', 'option-1', 'option-2', 'option-1-percentage', 'option-2-percentage', 'question-value', 'question-header']
    }

    connectedCallback(){
        super.connectedCallback();
        // this.questionValue = 50;
    }

    renderedCallback(){

        let nextButton = this.shadowRoot.querySelector('.next-button');
        nextButton.addEventListener('click', (event) => {
            this.moveToNextQuestion(event)
        });
        let previousButton = this.shadowRoot.querySelector('.previous-button');
        previousButton.addEventListener('click', (event) => {
            this.moveToPreviousQuestion(event)
        });

        let input = this.shadowRoot.querySelector('custom-input#value');
        input.addEventListener('custominputset', (event) => {
            this.setAttribute('question-value', event.detail.value);
            this.setAttribute('option-1-percentage', 100 - event.detail.value + '%');
            this.setAttribute('option-2-percentage', event.detail.value + '%');
            this.saveQuestionValue(event);
        });

    }

    rerenderedCallback(){
        if(!!this.getAttribute('question-value')){
            this.shadowRoot.querySelector('custom-input#value').setAttribute('value', this.getAttribute('question-value'));
        }
    }

    moveToNextQuestion(){
        //this.showProcessingWall();
        let nextEvent = new CustomEvent('next', () => {});
        this.dispatchEvent(nextEvent);
        //setTimeout(() => {
            //this.hideProcessingWall();
        //}, 200);
    }

    moveToPreviousQuestion(){
        let previousEvent = new CustomEvent('previous', () => {});
        this.dispatchEvent(previousEvent);
    }

    saveQuestionValue(event){
        let isValid = this.validateNumber();

        if(isValid){
            let questionEvent = new CustomEvent('questionvalueset', {
                detail: {
                    'questionId': this.getAttribute('question-id').toString(),
                    'value': this.getAttribute('question-value')
                }
            });

            this.dispatchEvent(questionEvent);
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

export default QuestionForm;