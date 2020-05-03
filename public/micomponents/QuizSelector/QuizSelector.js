//TODO: implement a loading icon for when email is sending
import MiCoolComponent from "../../micomponent-framework/MiCoolComponent.js";

class QuizSelector extends MiCoolComponent {

    static get observedAttributes(){
        return ["input-error-message"]
    }

    connectedCallback(){
        super.connectedCallback();
        this.quizCode = 'clevelandfriends';
    }

    renderedCallback(){
        
        let defaultQuizButton = this.shadowRoot.querySelector(".default-quiz-button");
        defaultQuizButton.addEventListener("click", event => {
            let quizSelected = new CustomEvent('quizselected', {
                detail: event.target.id
            });

            this.dispatchEvent(quizSelected);
        });

        let quizCodeInput = this.shadowRoot.querySelector('custom-input#datasetselector');
        quizCodeInput.addEventListener('custominputset', event => {
            this.quizCode = event.detail.value;
        });

        let quizCodeSubmit = this.shadowRoot.querySelector('.quiz-code-submit-button');
        quizCodeSubmit.addEventListener("click", event => {
            let quizSelected = new CustomEvent('quizselected', {
                detail: this.quizCode
            });

            this.dispatchEvent(quizSelected);
        });
        
    }

    
    showError(errorMessage){
        let message = "Sorry! There was an issue processing your request.  Feel free to reach out to me at michaelmatonis@hotmail.com or give me a call at the number listed below.Sorry! There was an issue processing your request.  Feel free to reach out to me at michaelmatonis@hotmail.com or give me a call at the number listed below.";
        if(errorMessage){
            message = errorMessage;
        }
        this.setAttribute('input-error-message', message);
    }
}
export default QuizSelector;