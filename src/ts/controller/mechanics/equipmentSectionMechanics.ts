
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
        const originalObjects = EquipmentSectionMechanics.getOriginalObjects( $sectionMechanics );

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
     * Get the number of picked objects on a section
     * @param sectionId The section to check
     * @returns The number of picked objects on the section
     */
    public static getNPickedObjects( sectionId : string ) : number {

        const $sectionMechanics : any = state.mechanics.getSection( sectionId );
        if( !$sectionMechanics )
            return 0;

        // Get the original objects on the section:
        const originalObjects = EquipmentSectionMechanics.getOriginalObjects( $sectionMechanics );

        // Get the the number of picked objects
        let pickedObjects = EquipmentSectionMechanics.getPickedObjects( $sectionMechanics , originalObjects , sectionId);

        return pickedObjects.length;
    }

    /** 
     * Choose equipment UI 
     */
    public static chooseEquipment(rule) {
        
        // Add the UI:
        gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-chooseEquipment') );
        gameView.enableNextLink(false);
        $('#mechanics-chooseEquipment-randoms-msg').text( mechanicsEngine.getRuleText( rule ) );

        // Initial test. Other tests are in randomMechanics.onRandomTableMechanicsClicked()
        EquipmentSectionMechanics.checkExitEquipmentSection();
    }

    /**
     * Checks if all links on the Equipment section have been clicked
     * Also check max number of 
     */
    public static checkExitEquipmentSection() {

        let ok = true;

        // There are pending random links to click?
        if( $('.action').not('.disabled').length > 0 )
            ok = false;
        else
            $('#mechanics-chooseEquipment-randoms').hide();

        // Check the max. number of special items. This limit starts on book 8, and you can come here
        // from book 7 with more special items
        const maxSpecials = ActionChart.getMaxSpecials();
        if( maxSpecials && state.actionChart.getNSpecialItems() > maxSpecials )
            ok = false;
        else
            $('#mechanics-chooseEquipment-maxSpecials').hide();

        if( ok ) {
            // The section can be left
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
     * Get the currently picked objects on a section
     * @param {jQuery} $sectionMechanics XML tag with the current section mechanics
     * @param originalObjects Original objects on the section. Key is the object id and 
     * the value is the number of objects
     * @param sectionId The section where to check picked objects. If it's null, the current section will be checked
     * @returns The different picked objects ids
     */
    private static getPickedObjects( $sectionMechanics : any , originalObjects : { [objectId : string ] : number } , sectionId : string = null ) 
    : Array<string> {
        
        // Get the current number of objects on the section:
        var sectionStateObjects = state.sectionStates.getSectionState(sectionId).objects;
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