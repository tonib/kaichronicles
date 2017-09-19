

interface AttributeDefiniton {
    /**
     * Attribute name
     */
    name : string,
    mandatory? : boolean
}

interface RuleDefinition {
    name : string,
    attributes? : Array<AttributeDefiniton>
}

class RulesDefinitions {

    private definitions : Array<RuleDefinition> = [];

    public constructor() {

        this.definitions = [

            { name: 'setSkills' },

            { 
                name: 'setDisciplines' , 
                attributes : [
                    { name : 'en-text' , mandatory : true },
                    { name : 'es-text' }
                ]
            },


        ];
    }

}
