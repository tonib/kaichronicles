/**
 * Combats mechanics
 */
class CombatMechanics {

    /**
     * Render section combats
     */
    public static renderCombats() {

        // Get combats to render
        const sectionState = state.sectionStates.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            return;
        }

        // If the player is death, do nothing
        if ( state.actionChart.currentEndurance <= 0 ) {
            return;
        }

        // Combat UI template:
        const $template = mechanicsEngine.getMechanicsUI("mechanics-combat");

        $template.attr("id", null);

        // Populate combats
        $.each(sectionState.combats, (index: number, combat: Combat) => {
            const $combatUI = $template.clone();
            // Set the combat index
            $combatUI.attr("data-combatIdx", index);

            // Add combats UI
            const $combatOriginal = $(".combat:eq(" + index + ")");

            $combatOriginal.append( $combatUI )
            .find(".mechanics-playTurn").click(function(e) {
                // Play turn button click
                e.preventDefault();
                CombatMechanics.runCombatTurn( $(this).parents(".mechanics-combatUI").first() ,
                    false );
            });

            // Move the show combat tables as the first child (needed because it's a float)
            const $btnCombatTables = $combatUI.find(".mechanics-combatTables");
            $btnCombatTables.remove();
            $combatOriginal.prepend( $btnCombatTables );

            // Bind the show combat tables button click
            $btnCombatTables.click((e) => {
                e.preventDefault();
                template.showCombatTables();
            });

            // Elude combat button click
            $combatOriginal.find(".mechanics-elude").click(function(e) {
                e.preventDefault();
                CombatMechanics.runCombatTurn( $(this).parents(".mechanics-combatUI").first() ,
                    true );
            });

            // Bind combat ratio link click
            $combatUI.find(".crlink").click(function( e: Event ) {
                e.preventDefault();
                CombatMechanics.showCombatRatioDetails( $(this).parents(".mechanics-combatUI").first() );
            });

            // Set enemy name on table
            $combatUI.find(".mechanics-enemyName").html( combat.enemy );
            // Set combat ratio:
            CombatMechanics.updateCombatRatio( $combatUI, combat );

            // Add already played turns
            if ( combat.turns.length > 0 ) {
                // Add already played turns
                const $turnsTable = $combatUI.find( "table" );
                $turnsTable.show();
                const $turnsTableBody = $turnsTable.find( "> tbody" );
                $.each( combat.turns, (idxTurn, turn) => {
                    CombatMechanics.renderCombatTurn( $turnsTableBody , turn );
                });
                // Update enemy current endurance
                CombatMechanics.updateEnemyEndurance( $combatUI , combat , true );
            }

            if ( sectionState.combatEluded || combat.isFinished() || combat.disabled ) {
                // Hide button to run more turns
                CombatMechanics.hideCombatButtons( $combatUI );
            } else {
                // Check if the combat can be eluded
                CombatMechanics.showHideEludeButton( combat , $combatUI );
            }

            if ( !state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge) || combat.noKaiSurge ) {
                // Hide Psi-surge check
                $combatUI.find(".kaisurgecheck").hide();
            } else {
                const $kaiSurgeCheck = $combatUI.find(".kaisurgecheck input");
                // Initialice Psi surge:
                if ( combat.kaiSurge ) {
                    $kaiSurgeCheck.attr( "checked" , true );
                    CombatMechanics.disablePsiSurge( $combatUI , combat );
                }
                // Check if the Psi-surge cannot be used (EP <= 6)
                if ( state.actionChart.currentEndurance <= Combat.minimumEPForKaiSurge() ) {
                    CombatMechanics.disableKaiSurge( $combatUI , combat );
                }
                // Psi surge selection
                $kaiSurgeCheck.click(function(e: Event) {
                    CombatMechanics.onKaiSurgeClick(e , $(this) );
                });

                // UI Psi-Surge texts
                let kaiSurgeBonus = combat.kaiSurgeBonus ? combat.kaiSurgeBonus : Combat.defaultKaiSurgeBonus();
                kaiSurgeBonus *= combat.mindblastMultiplier;
                $combatUI.find(".kaisurgebonus").text( kaiSurgeBonus );
                $combatUI.find(".kaisurgeloss").text( Combat.kaiSurgeTurnLoss() );
            }

            if ( !(state.actionChart.hasMgnDiscipline(MgnDiscipline.PsiSurge) || state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge))
                 || combat.noPsiSurge ) {
                // Hide Psi-surge check
                $combatUI.find(".psisurgecheck").hide();
            } else {
                const $psiSurgeCheck = $combatUI.find(".psisurgecheck input");
                // Initialice Psi surge:
                if ( combat.psiSurge ) {
                    $psiSurgeCheck.attr( "checked" , true );
                    CombatMechanics.disableKaiSurge( $combatUI , combat );
                }
                // Check if the Psi-surge cannot be used (EP <= 6)
                if ( state.actionChart.currentEndurance <= Combat.minimumEPForPsiSurge() ) {
                    CombatMechanics.disablePsiSurge( $combatUI , combat );
                }
                // Psi surge selection
                $psiSurgeCheck.click(function(e: Event) {
                    CombatMechanics.onPsiSurgeClick(e , $(this) );
                });

                // UI Psi-Surge texts
                let psiSurgeBonus = combat.psiSurgeBonus ? combat.psiSurgeBonus : Combat.defaultPsiSurgeBonus();
                psiSurgeBonus *= combat.mindblastMultiplier;
                $combatUI.find(".psisurgebonus").text( psiSurgeBonus );
                $combatUI.find(".psisurgeloss").text( Combat.psiSurgeTurnLoss() );
            }
        });

    }

    private static updateEnemyEndurance( $combatUI: JQuery<HTMLElement> , combat: Combat , doNotAnimate: boolean ) {
        template.animateValueChange( $combatUI.parent().find( ".enemy-current-endurance" ) ,
            combat.endurance , doNotAnimate , combat.endurance > 0 ? null : "red" );
    }

    private static updateCombatRatio( $combatUI: JQuery<HTMLElement> , combat: Combat ) {
        // Set combat ratio:
        $combatUI.find(".mechanics-combatRatio").text( combat.getCombatRatio() );
    }

    /**
     * Update all combats ratio on UI
     */
    public static updateCombats() {
        // Get combats to render
        const sectionState = state.sectionStates.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            return;
        }
        $.each(sectionState.combats, (index, combat) => {
            const $combatUI = $(".mechanics-combatUI:eq(" + index + ")");
            CombatMechanics.updateCombatRatio( $combatUI , combat);
        });
    }

    /**
     * Hide combat UI buttons
     * @param {jquery} $combatUI The combat UI where disable buttons. If it's null, all
     * combats buttons on the section will be hidden
     */
    public static hideCombatButtons( $combatUI: JQuery<HTMLElement> ) {
        if ( !$combatUI ) {
            // Disable all combats
            $combatUI = $(".mechanics-combatUI");
        }

        $combatUI.find(".mechanics-playTurn").hide();
        $combatUI.find(".mechanics-elude").hide();
    }

    /**
     * Show combat UI buttons
     * @param {jquery} $combatUI The combat UI where enable buttons. If it's null, all
     * combats buttons on the section will be hidden
     */
    public static showCombatButtons( $combatUI: JQuery<HTMLElement> ) {

        if ( !$combatUI ) {
            // Disable all combats
            $combatUI = $(".mechanics-combatUI");
        }

        if ( $combatUI.length === 0 ) {
            return;
        }

        // Get combat data
        const sectionState = state.sectionStates.getSectionState();
        const combatIndex = parseInt( $combatUI.attr( "data-combatIdx" ), 10 );
        const combat = sectionState.combats[ combatIndex ];

        if ( !(sectionState.combatEluded || combat.isFinished() || combat.disabled) ) {
            $combatUI.find(".mechanics-playTurn").show();
            CombatMechanics.showHideEludeButton( combat , $combatUI );
        }
    }

    /**
     * Run a combat turn
     * @param {jquery} $combatUI The combat UI
     * @param elude True if the player is eluding the combat
     */
    private static runCombatTurn( $combatUI: JQuery<HTMLElement>, elude: boolean ) {
        // Get the combat info:
        const combatIndex = parseInt( $combatUI.attr( "data-combatIdx" ), 10 );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        combat.nextTurnAsync( elude )
        .then((turn) => {

            // Apply turn combat losses
            combat.applyTurn(turn);

            // Combat has been eluded?
            sectionState.combatEluded = elude;

            // Update player statistics:
            template.updateStatistics();

            // Render new turn
            const $turnsTable = $combatUI.find( "table" ).first();
            $turnsTable.show();
            CombatMechanics.renderCombatTurn( $turnsTable.find( "> tbody" ), turn );

            // Update enemy current endurance
            CombatMechanics.updateEnemyEndurance( $combatUI , combat , false );

            if ( sectionState.combatEluded || combat.isFinished() ) {
                // Combat finished

                // Hide button to run more turns
                CombatMechanics.hideCombatButtons( $combatUI );

                // Test player death
                mechanicsEngine.testDeath();

                // Fire turn events:
                mechanicsEngine.fireAfterCombatTurn(combat);

                // Post combat rules execution:
                const combatsResult = sectionState.areAllCombatsFinished(state.actionChart);
                if ( combatsResult === "finished" && mechanicsEngine.onAfterCombatsRule ) {
                    // Fire "afterCombats" rule
                    mechanicsEngine.runChildRules( $(mechanicsEngine.onAfterCombatsRule) );
                }
                if ( combatsResult === "eluded" && mechanicsEngine.onEludeCombatsRule ) {
                    // Fire "afterElude" rule
                    mechanicsEngine.runChildRules( $(mechanicsEngine.onEludeCombatsRule) );
                }

                if ( ( combatsResult === "finished" || combatsResult === "eluded" ) && combat.adganaUsed ) {
                    // Fire post-combat adgana effects
                    SpecialObjectsUse.postAdganaUse();
                }
            } else {
                // Combat continues

                // Check if the combat can be eluded
                CombatMechanics.showHideEludeButton( combat , $combatUI );

                // Fire turn events:
                mechanicsEngine.fireAfterCombatTurn(combat);

                // Update combat ratio (it can be changed by combat turn rules):
                CombatMechanics.updateCombatRatio( $combatUI , combat );
            }

            // Combat has been eluded?
            if ( elude ) {
                // Disable other combats
                CombatMechanics.hideCombatButtons( null );
            }

            // Check if the Psi-surge should be disabled after this turn
            CombatMechanics.checkPsiSurgeEnabled();

            // Check if the Kai-surge should be disabled after this turn
            CombatMechanics.checkKaiSurgeEnabled();
        });

    }

    /**
     * Update visibility of the elude combat button
     * @param combat The combat to update
     * @param {jQuery} $combatUI The combat UI
     */
    private static showHideEludeButton( combat: Combat , $combatUI: JQuery<HTMLElement> ) {
        if ( combat.canBeEluded() ) {
            // The combat can be eluded after this turn
            $combatUI.find(".mechanics-elude").show();
        } else {
            $combatUI.find(".mechanics-elude").hide();
        }
    }

    /**
     * Render a combat turn
     * @param {jquery} $combatTable Table where to append the turn
     * @param turn The turn to render
     */
    private static renderCombatTurn( $combatTableBody: JQuery<HTMLElement> , turn: CombatTurn ) {
        $combatTableBody.append(
            '<tr><td class="hidden-xs">' + turn.turnNumber + "</td><td>" + turn.randomValue +
            "</td><td>" + turn.getPlayerLossText() + "</td><td>" +
            turn.getEnemyLossText() + "</td></tr>"
        );
    }

    /**
     * Psi-surge event handler
     */
    private static onPsiSurgeClick(e: Event, $psiSurgeCheck: JQuery<HTMLElement>) {

        const $combatUI = $psiSurgeCheck.parents(".mechanics-combatUI").first();
        const combatIndex = parseInt( $combatUI.attr( "data-combatIdx" ), 10 );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const selected: boolean = $psiSurgeCheck.prop( "checked" ) ? true : false;
        combat.psiSurge = selected;

        // If click on PsiSurge, uncheck KaiSurge
        const $kaiSurgeCheck = $combatUI.find(".kaisurgecheck input");
        $kaiSurgeCheck.prop("checked", false);
        combat.kaiSurge = false;

        if ( !selected && state.actionChart.currentEndurance <= Combat.minimumEPForKaiSurge() ) {
            CombatMechanics.disableKaiSurge( $combatUI , combat );
        }

        CombatMechanics.updateCombatRatio( $combatUI , combat);
    }

    /**
     * Kai-surge event handler
     */
    private static onKaiSurgeClick(e: Event, $kaiSurgeCheck: JQuery<HTMLElement>) {

        const $combatUI = $kaiSurgeCheck.parents(".mechanics-combatUI").first();
        const combatIndex = parseInt( $combatUI.attr( "data-combatIdx" ), 10 );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const selected: boolean = $kaiSurgeCheck.prop( "checked" ) ? true : false;
        combat.kaiSurge = selected;

        // If click on KaiSurge, uncheck PsiSurge
        const $psiSurgeCheck = $combatUI.find(".psisurgecheck input");
        $psiSurgeCheck.prop("checked", false);
        combat.psiSurge = false;

        if ( !selected && state.actionChart.currentEndurance <= Combat.minimumEPForPsiSurge() ) {
            CombatMechanics.disablePsiSurge( $combatUI , combat );
        }

        CombatMechanics.updateCombatRatio( $combatUI , combat);
    }

    /**
     * Check if the Psi-surge can be enabled.
     * It cannot be used if the EP <= 6
     */
    public static checkPsiSurgeEnabled() {

        if ( !(state.actionChart.hasMgnDiscipline(MgnDiscipline.PsiSurge) || state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge)) ) {
            return;
        }
        if ( state.actionChart.currentEndurance > Combat.minimumEPForPsiSurge() ) {
            return;
        }
        const sectionState = state.sectionStates.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            return;
        }
        for ( let i = 0; i < sectionState.combats.length; i++ ) {
            const $combatUI = $(".mechanics-combatUI:eq(" + i + ")");
            CombatMechanics.disablePsiSurge( $combatUI , sectionState.combats[i]);
        }

    }

    /**
     * Check if the Psi-surge can be enabled.
     * It cannot be used if the EP <= 6
     */
    public static checkKaiSurgeEnabled() {

        if ( !state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge) ) {
            return;
        }
        if ( state.actionChart.currentEndurance > Combat.minimumEPForKaiSurge() ) {
            return;
        }
        const sectionState = state.sectionStates.getSectionState();
        if ( sectionState.combats.length === 0 ) {
            return;
        }
        for ( let i = 0; i < sectionState.combats.length; i++ ) {
            const $combatUI = $(".mechanics-combatUI:eq(" + i + ")");
            CombatMechanics.disableKaiSurge( $combatUI , sectionState.combats[i]);
        }

    }

    /**
     * Disable Psi-surge on a combat
     */
    private static disablePsiSurge( $combatUI: JQuery<HTMLElement> , combat: Combat ) {
        combat.psiSurge = false;
        const $psiSurgeCheck = $combatUI.find(".psisurgecheck input");
        $psiSurgeCheck.prop("checked", false);
        $psiSurgeCheck.prop("disabled", true);
        CombatMechanics.updateCombatRatio( $combatUI , combat );
    }

    /**
     * Disable Kai-surge on a combat
     */
    private static disableKaiSurge( $combatUI: JQuery<HTMLElement> , combat: Combat ) {
        combat.kaiSurge = false;
        const $kaiSurgeCheck = $combatUI.find(".kaisurgecheck input");
        $kaiSurgeCheck.prop("checked", false);
        $kaiSurgeCheck.prop("disabled", true);
        CombatMechanics.updateCombatRatio( $combatUI , combat );
    }

    /**
     * Show dialog with combat ratio details
     * @param {jQuery} $combatUI The combat UI
     */
    private static showCombatRatioDetails( $combatUI: JQuery<HTMLElement> ) {
        // Get the combat info:
        const combatIndex = parseInt( $combatUI.attr( "data-combatIdx" ), 10 );
        const sectionState = state.sectionStates.getSectionState();
        const combat = sectionState.combats[ combatIndex ];

        const finalCSPlayer = combat.getCurrentCombatSkill();

        // Player CS for this combat:
        let csPlayer: string = state.actionChart.combatSkill.toString();
        const bonuses = combat.getCSBonuses();
        for ( const bonus of bonuses ) {
            csPlayer += " ";
            if ( bonus.increment >= 0 ) {
                csPlayer += "+";
            }
            csPlayer += bonus.increment.toString() + " (" + bonus.concept + ")";
        }
        if ( bonuses.length > 0 ) {
            csPlayer += " = " + finalCSPlayer.toString();
        }
        $("#game-ratioplayer").text( csPlayer );

        // Enemy info:
        $("#game-ratioenemyname").text( combat.enemy );
        $("#game-ratioenemy").text( combat.combatSkill );

        // Combat ratio result:
        $("#game-ratioresult").text( finalCSPlayer + " - " + combat.combatSkill + " =  " + ( finalCSPlayer - combat.combatSkill ) );

        // Show dialog
        $("#game-ratiodetails").modal();
    }

}
