
/// <reference path="../../external.ts" />

/**
 * Setup player disciplines
 */
class SetupDisciplines {

    /**
     * Weapons table for Weaponskill discipline on Kai books
     */
    private readonly kaiWeapons = [ 'dagger' , 'spear' , 'mace' , 'shortsword' , 'warhammer', 'sword',
                                    'axe' , 'sword' , 'quarterstaff' , 'broadsword' ];

    /**
     * Weapons table for Weaponmastery discipline on Magnakai books
     */                       
    private readonly magnakaiWeapons = [ 'dagger' , 'spear' , 'mace' , 'shortsword' , 'warhammer', 'bow',
                                         'axe' , 'sword' , 'quarterstaff' , 'broadsword' ];
    /**
     * Expected number of disciplines to choose
     */
    private readonly expectedNDisciplines : number;

    /**
     * The last book player action chart. 
     * null if this is the first book the player play
     */
    private readonly previousActionChart : any;

    constructor() {
        this.previousActionChart = state.getPreviousBookActionChart( state.book.bookNumber - 1);
        this.expectedNDisciplines = this.getNExpectedDisciplines();
    }

     /**
     * Choose the kai disciplines UI
     */
    public setupDisciplinesChoose() {

         // Add the warning about the number of disciplines
        gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-setDisciplines-NDis') );
        $('#mechanics-nDisciplines').text( this.expectedNDisciplines );

        // Add the warning about the number of weapons for weaponmastery
        gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-setDisciplines-NWeapons') );
        $('#mechanics-setDisciplines-weaponsmax').text( this.getExpectedNWeaponsWeaponmastery() );
        
        // Add checkbox for each discipline:
        const self = this;
        $('.subsection[id!="mksumary"]').append( mechanicsEngine.getMechanicsUI('mechanics-setDisciplines') )
        .each(function(index, disciplineSection) {
            self.setupDisciplineCheckBox( $(disciplineSection) );
        })
        // Set events when checkboxes are clicked
        .find('input[type=checkbox]')
        .click(function(e) {
            self.onDiscliplineCheckBoxClick(e, $(this) );
        });

        // If we are on a magnakai book, add the weapons checkboxes
        this.populateMagnakaiWeapons();

        // Set the already choosen weapon for the Weaponskill
        this.setWeaponSkillWeaponNameOnUI();

        // Initialize UI state
        this.afterDisciplineSelection();
    }

    /**
     * Add checkboxes to select weapons for Weaponmastery.
     * Only for magnakai books
     */
    private populateMagnakaiWeapons() {
        // Only for magnakai books
        if( state.book.bookNumber <= 5 )
            return;

        // Add checkboxes
        const $checkboxTemplate = mechanicsEngine.getMechanicsUI('mechanics-magnakaiWeapon');
        let html = '';
        for( let i=0; i < this.magnakaiWeapons.length; i++ ) {
            if( i % 2 === 0 )
                html += '<div class="row">';

            // Prepare the weapon UI
            const weaponItem = state.mechanics.getObject( this.magnakaiWeapons[i] );
            const $checkbox = $checkboxTemplate.clone();
            $checkbox.attr( 'id' , weaponItem.id );
            $checkbox.find( '.mechanics-wName' ).text( weaponItem.name );

            // The weapon has been already selected?
            const selected : boolean = state.actionChart.weaponSkill.contains( this.magnakaiWeapons[i] );
            $checkbox.find( 'input' ).attr( 'checked' , selected );

            html += $checkbox[0].outerHTML;

            if( i % 2 == 1 )
                html += '</div>';
        }
        const $well = $('#wpnmstry .well');
        $well.append ( html );

        // Add event handlers
        const self = this;
        $well.find( 'input.weaponmastery-chk' )
        .click( function( e : Event) {
            self.onWeaponmasteryWeaponClick( e, $(this) );
        });

        // Set the initial state
        this.enableMagnakaiWeapons();
    }

    /**
     * Enable or disable weapons selection for Weaponmastery
     */
    private enableMagnakaiWeapons() {

        // Only for magnakai books
        if( state.book.bookNumber <= 5 )
            return;

        var disable : boolean = false;

        // If Weaponmastery is not selected, disable all weapons
        if( !state.actionChart.disciplines.contains( 'wpnmstry' ) ) {
            $( 'input.weaponmastery-chk' ).prop( 'disabled' , true );
            return;
        }
        
        // By default, enable all weapons
        $( 'input.weaponmastery-chk' ).prop( 'disabled' , false );

        // If Weaponmastery was selected on a previous book, disable disable the weapons already
        // selected on the previous book
        if( !window.getUrlParameter('debug') && this.previousActionChart && 
            this.previousActionChart.disciplines.contains( 'wpnmstry' ) ) {
            for( let weaponId of this.previousActionChart.weaponSkill )
                $('#' + weaponId + ' input[type=checkbox]').prop( 'disabled' , true );
        }
    }

    /** 
     * Returns the number of weapons to select for the Weaponmastery discipline.
     * Only for magnakai books
     */
    private getExpectedNWeaponsWeaponmastery() : number {
        let nWeapons = 3;

        if( state.book.bookNumber >= 13 ) {
            nWeapons = 2;
        }
        // If first book of a serie, don't check previous book        
        if(state.book.bookNumber == 13 ) {
            return nWeapons;
        }

        if( this.previousActionChart && this.previousActionChart.disciplines.contains( 'wpnmstry' ) )
            // One more for this book
            nWeapons = this.previousActionChart.weaponSkill.length + 1;
        return nWeapons;
    }

    /**
     * Click on a Weaponmastery weapon event handler
     * @param e The click event
     * @param  $checkBox The checkbox (jQuery)
     */
    private onWeaponmasteryWeaponClick(e: Event, $checkBox : any) {

        const selected : boolean = $checkBox.prop( 'checked' );
        const weaponId : string = $checkBox.closest('.weaponmastery-weapon').attr('id');

        if( selected ) {
            // Check the maximum weapons number
            const nExpectedWeapons = this.getExpectedNWeaponsWeaponmastery();
            if( !window.getUrlParameter('debug') && state.actionChart.weaponSkill.length >= nExpectedWeapons ) {
                e.preventDefault();
                alert( translations.text( 'onlyNWeapons' , [nExpectedWeapons] ) );
                return;
            }
            state.actionChart.weaponSkill.push( weaponId );
        }
        else 
            state.actionChart.weaponSkill.removeValue( weaponId );

        // Update UI
        this.afterDisciplineSelection();
    }

    /**
     * Initialize a discliplne check box
     * @param $disciplineSection The checkbox to initialize (Jquery)
     */
    private setupDisciplineCheckBox( $disciplineSection : any ) {

        // Set the discipline name on the checkbox
        let $title = $disciplineSection.find( '.subsectionTitle' );
        $disciplineSection.find( '.mechanics-dName' ).text( $title.text() );

        // Set checkbox initial value
        let disciplineId : string = $disciplineSection.attr('id');
        let $check = $disciplineSection.find( 'input[type=checkbox]' ); 
        $check.attr('checked' , state.actionChart.disciplines.contains(disciplineId) );

        // If the player had this discipline on the previous book, disable the check
        // On debug mode, always enabled
        if( !window.getUrlParameter('debug') && this.previousActionChart && 
            this.previousActionChart.disciplines.contains(disciplineId) )
            $check.prop( 'disabled' , true );
    }

    /**
     * Handle click on discipline checkbox
     * @param e The click event
     * @param $checkBox The clicked checkbox (JQuery)
     */
    private onDiscliplineCheckBoxClick( e : Event, $checkBox : any ) {

        // Limit the number of disciplines. Unlimited on debug mode
        const selected : boolean = $checkBox.prop( 'checked' );
        if( selected && this.getAllDisciplinesSelected() && !window.getUrlParameter('debug') ) {
            e.preventDefault();
            alert( translations.text( 'maxDisciplines' , [ this.expectedNDisciplines ] ) );
            return;
        }

        // Add / remove the discipline
        const disciplineId : string = $checkBox.closest('.subsection').attr('id');
        if( selected )
            this.onDisciplineSelected(e, disciplineId);
        else
            state.actionChart.disciplines.removeValue( disciplineId );

        this.afterDisciplineSelection();
    }

    /**
     * Discipline selected event handler
     * @param e The discipline check box click event
     * @param disciplineId The selected discipline
     */
    private onDisciplineSelected(e : Event, disciplineId : string) {

        if( disciplineId == 'wepnskll' ) {
            // Special case for kai series: Choose on the random table the weapon
            this.chooseWeaponskillWeapon(e);
            return;
        }

        state.actionChart.disciplines.push( disciplineId );
    }

    /**
     * Code to call after a discipline is selected / deselected
     */
    private afterDisciplineSelection() {

        let enableNextPage = true;

        // Check all disiciplines selected
        if( this.getAllDisciplinesSelected() )
            $('#mechanics-setDisciplines-NDis').hide();
        else {
            $('#mechanics-setDisciplines-NDis').show();
            enableNextPage = false;
        }

        // Check weapons selected for magnakai books
        let showWeaponsWarning = false;
        if( state.book.bookNumber > 5 && state.actionChart.disciplines.contains( 'wpnmstry' ) && 
            state.actionChart.weaponSkill.length < this.getExpectedNWeaponsWeaponmastery() ) {
            enableNextPage = false;
            $('#mechanics-setDisciplines-NWeapons').show();
        }
        else
            $('#mechanics-setDisciplines-NWeapons').hide();

        gameView.enableNextLink( enableNextPage );

        this.enableMagnakaiWeapons();
        template.updateStatistics();
    }

    /**
     * Do the random choice for Weaponskill weapon.
     * Only applies to Kai serie
     */
    private chooseWeaponskillWeapon(e : Event) {

        if( state.actionChart.weaponSkill.length > 0 ) {
            // Weapon already choosed
            state.actionChart.disciplines.push( 'wepnskll' );
            return;
        }

        // Do not mark the check yet. The "if" is REQUIRED, otherwise the check is not marked with computer generated random table
        if( state.actionChart.manualRandomTable )
            e.preventDefault();

        // Pick a  random number
        const self = this;
        randomTable.getRandomValueAsync()
        .then(function(value : number) {

            // Store the discipline
            state.actionChart.disciplines.push( 'wepnskll' );
            state.actionChart.weaponSkill.push( self.kaiWeapons[ value ] );

            // Show on UI the selected weapon
            self.setWeaponSkillWeaponNameOnUI();
            const $well = $('#wepnskll .well');
            $well.append('<div><i><small>' + translations.text('randomTable') + ': ' + value + '</small></i></div>');

            // Mark the checkbox
            $well.find( 'input[type=checkbox]' ).prop( 'checked' , true ); 

            self.afterDisciplineSelection();
        });
    }

    /**
     * Set the weapon name on UI.
     * Only applies to Kai serie
     */
    private setWeaponSkillWeaponNameOnUI() {

        if( state.actionChart.weaponSkill.length === 0 )
            // No weapon selected yet
            return;
        if( state.book.bookNumber > 5 )
            // Only for kai books
            return;

        const o = state.mechanics.getObject( state.actionChart.weaponSkill[0] );
        $('#wepnskll .mechanics-wName').text('(' + o.name + ')');
    }

    /**
     * Get the number of expected disciplines on the current book
     * @returns Number of expected disciplines
     */
    private getNExpectedDisciplines() : number {
        let expectedNDisciplines = 5;

        if(state.book.bookNumber >= 6 && state.book.bookNumber < 13) {
            expectedNDisciplines = 3;
        } else if( state.book.bookNumber >= 13 ) {
            expectedNDisciplines = 4;
        }
        // If first book of a serie, don't check previous book
        if(state.book.bookNumber == 6 || state.book.bookNumber == 13 ) {
            return expectedNDisciplines;
        }

        // Number of disciplines to choose (previous book disciplines + 1):
        if( this.previousActionChart )
            expectedNDisciplines = this.previousActionChart.disciplines.length + 1;
        
        return expectedNDisciplines;
    }

    /**
     * Are all disciplines selected?
     * @returns True if all disciplines are selected
     */
    private getAllDisciplinesSelected() : boolean {
        return state.actionChart.disciplines.length >= this.expectedNDisciplines;
    }

}
