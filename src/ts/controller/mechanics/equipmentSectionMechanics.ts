
/**
 * Equipment section mechanics
 */
class EquipmentSectionMechanics {

    /**
     * Check if some more object can be picked on the current section
     * This will throw an exception if you cannot pick more objects
     * @param pickedObjectId The picked object id
     */
    public static checkMoreObjectsCanBePicked( pickedObjectId : string ) {
        
        // Check if the section has restrictions about the number of pickable objects:
        const $sectionMechanics : any = state.mechanics.getSection( state.sectionStates.currentSection );
        if( !$sectionMechanics )
            return;
        const txtNPickableObjects : string = $sectionMechanics.attr('pickMaximum');
        if( !txtNPickableObjects )
            return;
        const nPickableObjects = parseInt( txtNPickableObjects );

        // Get the original objects on the section:
        var originalObjects = EquipmentSectionMechanics.getOriginalObjects( $sectionMechanics );

        // If the object was not originally on the section, ignore it
        if( !originalObjects[ pickedObjectId ] ) 
            return;

        // Get the the number of picked objects
        let pickedObjects = EquipmentSectionMechanics.getPickedObjects( $sectionMechanics , 
            originalObjects );

        if( pickedObjects.length >= nPickableObjects && !pickedObjects.contains(pickedObjectId) )
            // D'oh!
            throw translations.text( 'maximumPick' , [nPickableObjects] );
    }

    /** 
     * Choose equipment UI 
     */
    public static chooseEquipment(rule) {
        
        // Add the UI:
        gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-chooseEquipment') );
        gameView.enableNextLink(false);
        $('#mechanics-chooseEquipment-msg').text( mechanicsEngine.getRuleText( rule ) );

        // Initial test. Other tests are in randomMechanics.onRandomTableMechanicsClicked()
        EquipmentSectionMechanics.chooseEquipmentTestAllClicked();
    }

    /**
     * Checks if all links on the Equipment section have been clicked
     */
    public static chooseEquipmentTestAllClicked() {
        if( $('.action').not('.disabled').length === 0 ) {
            $('#mechanics-chooseEquipment').hide();
            gameView.enableNextLink(true);
        }
    }

    /**
     * Get the original objects on the section
     * @returns An object. Key is the object id and the value is the number of objects
     */
    private static getOriginalObjects( $sectionMechanics : any ) : { [objectId : string ] : number } {
        
        // Get the original objects on the section:
        var childrenRules = $sectionMechanics.children();
        var originalObjects = {};
        for(var i=0; i<childrenRules.length; i++) {
            var rule = childrenRules[i];
            if( rule.nodeName == 'object' ) {
                var objectid = $(rule).attr('objectId');
                if( !originalObjects[objectid] )
                    originalObjects[objectid] = 1;
                else
                    originalObjects[objectid] += 1;
            }
        }

        return originalObjects;
    }

    /**
     * Get the currently  picked objects on the section
     * @param {jQuery} $sectionMechanics XML tag with the current section mechanics
     * @param originalObjects Original objects on the section. Key is the object id and 
     * the value is the number of objects
     * @returns The different picked objects ids
     */
    private static getPickedObjects( $sectionMechanics : any , originalObjects : { [objectId : string ] : number } ) 
    : Array<string> {
        
        // Get the current number of objects on the section:
        var sectionStateObjects = state.sectionStates.getSectionState().objects;
        var currentObjects : { [objectId : string ] : number } = {};
        let objectId : string;
        for(let i=0; i<sectionStateObjects.length; i++) {
            objectId = sectionStateObjects[i].id;
            if( !currentObjects[objectId] )
                currentObjects[objectId] = 1;
            else
                currentObjects[objectId] += 1;
        }

        // Check the currently number of picked objects
        let pickedObjects : Array<string> = [];
        for( objectId in originalObjects) {

            if ( !originalObjects.hasOwnProperty(objectId) )
                continue;
            
            var nOriginal = originalObjects[objectId];

            var nCurrent = currentObjects[objectId];
            if( !nCurrent )
                nCurrent = 0;
            
            var increase = nOriginal - nCurrent;
            if( increase > 0 )
                pickedObjects.push( objectId );
        }

        return pickedObjects;
    }
    
}