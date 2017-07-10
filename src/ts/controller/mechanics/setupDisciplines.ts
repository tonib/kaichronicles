
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
     * Expected number of disciplines to choose
     */
    private readonly expectedNDisciplines : number;

    /**
     * The last book player action chart. 
     * null if this is the first book the player play
     */
    private readonly previousActionChart : any;

    constructor() {
        this.expectedNDisciplines = this.getNExpectedDisciplines();
        this.previousActionChart = state.getPreviousBookActionChart( state.book.bookNumber - 1);
    }

     /**
     * Choose the kai disciplines UI
     */
    public setupDisciplinesChoose() {

         // Add the warning about the number of disciplines:
        gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-setDisciplines-NDis') );
        $('#mechanics-nDisciplines').text( this.expectedNDisciplines );
        if( this.getAllDisciplinesSelected() ) {
            $('#mechanics-setDisciplines-NDis').hide();
            gameView.enableNextLink(true);
        }
        else
            gameView.enableNextLink(false);

        // Add checkbox for each discipline:
        const self = this;
        $('.subsection').append( mechanicsEngine.getMechanicsUI('mechanics-setDisciplines') )
        .each(function(index, disciplineSection) {
            self.setupDisciplineCheckBox( $(disciplineSection) );
        })
        // Set events when checkboxes are clicked
        .find('input[type=checkbox]')
        .click(function(e) {
            self.onDiscliplineCheckBoxClick(e, $(this) );
        });

        // Set the already choosen weapon for the skill
        this.setWeaponSkillWeaponNameOnUI();
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
        // Update the UI
        if( this.getAllDisciplinesSelected() ) {
            $('#mechanics-setDisciplines-NDis').hide();
            gameView.enableNextLink(true);
        }
        else {
            $('#mechanics-setDisciplines-NDis').show();
            gameView.enableNextLink(false);
        }
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
            return;
        const o = state.mechanics.getObject( state.actionChart.weaponSkill[0] );
        $('#wepnskll .mechanics-wName').text('(' + o.name + ')');
    }

    /**
     * Get the number of expected disciplines on the current book
     * @returns Number of expected disciplines
     */
    private getNExpectedDisciplines() : number {

        if( state.book.bookNumber == 6 )
            // Special case: We start the magnakai series always with 3 disciplines:
            return 3;

        // Number of disciplines to choose (previous book disciplines + 1, or 5 for kai series, or 3 for magnakai series):
        let expectedNDisciplines = ( state.book.bookNumber <= 5 ? 5 : 3 );
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
