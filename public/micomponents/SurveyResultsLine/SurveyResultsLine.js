//TODO: implement a loading icon for when email is sending
import MiCoolComponent from "../../micomponent-framework/MiCoolComponent.js";

class SurveyResults extends MiCoolComponent {

    static get observedAttributes(){
        return ['match', 'match-percentage']
    }

    // connectedCallback(){
    //     super.connectedCallback();
    // }

    // renderedCallback(){

    // }
}

export default SurveyResults;