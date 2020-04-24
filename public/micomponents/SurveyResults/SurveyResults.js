//TODO: implement a loading icon for when email is sending
import MiCoolComponent from "../../micomponent-framework/MiCoolComponent.js";

class SurveyResults extends MiCoolComponent {

    static get observedAttributes(){
        return ['results']
    }

    connectedCallback(){
        super.connectedCallback();
    }

    renderedCallback(){

    }

    showResults(){
        // this.results = this.results.sort((a, b) => {
        //     return b.score - a.score;
        // });

        this.results.forEach((result) => {
            var resultLine = document.createElement( 'survey-results-line' );
            resultLine.setAttribute('match', result.name);
            resultLine.setAttribute('match-percentage', result.score + '%');
            this.shadowRoot.querySelector('.results-container').appendChild( resultLine );
        })
    }
}

export default SurveyResults;