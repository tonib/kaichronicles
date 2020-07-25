
class Combat {

    /** Enemy name */
    public enemy: string;

    /** Enemy combat skill */
    public combatSkill: number;

    /** Enemy current endurance points  */
    public endurance: number;

    /** Enemy original endurance points  */
    public originalEndurance: number;

    /** Combat turns */
    public turns: CombatTurn[] = [];

    /** Increment of combat skill of Lone Wolf in this combat  */
    public combatModifier = 0;

    /** Increment of combat skill by objects usage  */
    public objectsUsageModifier = 0;

    /** The enemy is immune to Mindblast? */
    public noMindblast = false;

    /** The enemy is immune to Psi-Surge? */
    public noPsiSurge = false;

    /** The enemy is immune to Kai-Surge? */
    public noKaiSurge = false;

    /** The CS bonus to apply if the player has Mindblast discipline */
    public mindblastBonus;

    /** The CS bonus to apply if the player has Psi-Surge discipline */
    public psiSurgeBonus;

    /** The CS bonus to apply if the player has Kai-Surge discipline */
    public kaiSurgeBonus;

    /** The CS multiplier to apply to Mindblast/Psi-Surge attacks */
    public mindblastMultiplier = 1;

    /** How many turns the player cannot use weapons on this combat. -1 = never */
    public noWeaponTurns = 0;

    /** Check if the combat is non-physical (disables most bonuses) */
    public mentalOnly = false;

    /** Turn beyond which the combat can be eluded. -1 = no elude */
    public eludeTurn = -1;

    /** Maximum turn which the combat can be eluded. -1 === no max turn */
    public maxEludeTurn = -1;

    /** Combat can be eluded if enemy has EP equals or below. -1 === no elude */
    public eludeEnemyEP = -1;

    /** Combat has been disabled? */
    public disabled = false;

    /** Enemy is immune for X turns */
    public enemyImmuneTurns = 0;

    /** LW is immune for X turns */
    public immuneTurns = 0;

    /** Player dammage multiplier */
    public dammageMultiplier = 1.0;

    /** Enemy dammage multiplier */
    public enemyMultiplier = 1.0;

    /** Mindforce negative bonus by enemy mindforce attack */
    public mindforceCS = 0;

    /**
     * Player extra endurance points lost each turn by enemy mindforce attack.
     * It must to be negative.
     */
    public mindforceEP = 0;

    /**
     * Extra E.P. lost by the enemy each turn. It must to be negative.
     */
    public enemyTurnLoss = 0;

    /**
     * Extra E.P. lost by the player each turn. It must to be negative.
     */
    public turnLoss = 0;

    /**
     * Extra E.P. lost by the player, if the player has been wounded on that turn. It must to be negative.
     */
    public turnLossIfWounded = 0;

    /** Book 2 / sect276: True if the combat is not a combat to death */
    public fakeCombat = false;

    /** If fakeCombat is true, percentage of the E.P. lost to restore  */
    public fakeRestoreFactor = 1.0;

    /** The original endurance of the player before the combat (for fake combats) */
    public originalPlayerEndurance = state.actionChart.currentEndurance;

    /** Combat has been finished? */
    public combatFinished = false;

    /** Psi-surge / Kai-surge is activated on this combat? */
    public psiSurge = false;

    /** It's a bow combat? If false, it's a hand-to-hand combat */
    public bowCombat = false;

    /** Object ids that cannot be used on this combat. */
    public disabledObjects: string[] = [];

    /** Adgana has been used on this combat? (see "pouchadgana" object) */
    public adganaUsed = false;

    /** Loss on this combat is permanent (reduce original endurance)? */
    public permanentDammage = false;

    /**
     * Create a combat
     * @param enemy Enemy name
     * @param combatSkill Enemy combat skill
     * @param endurance Enemy endurance points
     */
    constructor(enemy: string, combatSkill: number, endurance: number) {

        /** Enemy name */
        this.enemy = enemy;
        /** Enemy combat skill */
        this.combatSkill = combatSkill;
        /** Enemy endurance points  */
        this.endurance = endurance;
        /** Enemy original endurance points  */
        this.originalEndurance = endurance;

        /** The original endurance of the player before the combat (for fake combats) */
        this.originalPlayerEndurance = state.actionChart.currentEndurance;

        // Default Kai-Surge / Psi-Surge / Mindblast bonuses
        this.kaiSurgeBonus = Combat.defaultSurgeBonus(GndDiscipline.KaiSurge);
        this.psiSurgeBonus = Combat.defaultSurgeBonus(MgnDiscipline.PsiSurge);
        this.mindblastBonus = Combat.defaultMindblastBonus();
    }

    /**
     * Get the player combat skill for this combat
     * @return The current combat skill
     */
    public getCurrentCombatSkill(): number {
        let cs = state.actionChart.combatSkill;
        for (const bonus of this.getCSBonuses()) {
            cs += bonus.increment;
        }
        return cs;
    }

    /**
     * Get the current combat bonuses
     * @returns The combat bonuses. It includes the Action Chart bonuses
     */
    public getCSBonuses(): Bonus[] {
        const bonuses: Bonus[] = [];

        for (const bonus of state.actionChart.getCurrentCombatSkillBonuses(this)) {
            bonuses.push(bonus);
        }

        if (this.combatModifier) {
            bonuses.push({
                increment: this.combatModifier,
                concept: translations.text("sectionModifier")
            });
        }

        if (!this.mentalOnly && this.objectsUsageModifier) {
            bonuses.push({
                increment: this.objectsUsageModifier,
                concept: translations.text("objectsUse")
            });
        }

        if (this.mindforceCS < 0 && !state.actionChart.hasMindShield()) {
            bonuses.push({
                increment: this.mindforceCS,
                concept: translations.text("enemyMindblast")
            });
        }

        return bonuses;
    }

    /**
     * Returns the combat ratio for this combat
     */
    public getCombatRatio(): number {
        return this.getCurrentCombatSkill() - this.combatSkill;
    }

    /**
     * Get the next combat turn
     * @param elude True if the player is eluding the combat
     * @return Promise with the next CombatTurn
     */
    public nextTurnAsync(elude: boolean): JQueryPromise<CombatTurn> {

        const dfd = jQuery.Deferred<CombatTurn>();

        // Calculate the turn
        randomTable.getRandomValueAsync()
            .then((randomValue) => {
                const helshezagUsed = (state.actionChart.getSelectedWeapon() === Item.HELSHEZAG);
                const turn = new CombatTurn(this, randomValue, elude, helshezagUsed);
                this.turns.push(turn);
                dfd.resolve(turn);
            });

        return dfd.promise();
    }

    public static applyLoss(currentEndurance: number, loss: any): number {
        if (loss === COMBATTABLE_DEATH) {
            return 0;
        } else {
            currentEndurance -= loss;
            if (currentEndurance < 0) {
                currentEndurance = 0;
            }
            return currentEndurance;
        }
    }

    /**
     * Check if the player should lose permanently 1 EP due to use of Helshezag on this combat
     * @param turn The current played turn
     * @returns True if the player should lose 1 EP on this turn
     */
    private checkHelshezagPermanentLoss(turn: CombatTurn): boolean {

        if (!turn.helshezagUsed) {
            // Helshezag not used on this turn
            return false;
        }

        // Helshezag effects do not apply on book 12 / sect133
        if (state.book.bookNumber === 12 && state.sectionStates.currentSection === "sect133") {
            return false;
        }

        // Check if this is the second or subsequent turn where the Helshezag was used on this combat
        for (let i = 0; i < (turn.turnNumber - 1); i++) {
            if (this.turns[i].helshezagUsed) {
                return true;
            }
        }
        return false;
    }

    /**
     * Apply the combat turn effects
     * @param turn The turn to apply
     */
    public applyTurn(turn: CombatTurn) {

        // Apply player damages:
        if (turn.loneWolf === COMBATTABLE_DEATH) {
            state.actionChart.currentEndurance = 0;
        } else {

            // Aply dammage
            state.actionChart.increaseEndurance(-turn.loneWolf, this.permanentDammage);

            // If dammage is permanent, display a toast
            if (this.permanentDammage) {
                actionChartController.displayEnduranceChangeToast(-turn.loneWolf, true);
            }

            if (this.checkHelshezagPermanentLoss(turn)) {
                // Apply a permanent -1 EP due to Helshezag use
                actionChartController.increaseEndurance(-1, false, true);
            }
        }

        // Apply enemy damages:
        this.endurance = Combat.applyLoss(this.endurance, turn.enemy);

        // Check if the combat has been finished
        if (turn.elude || this.endurance === 0 || state.actionChart.currentEndurance === 0) {
            this.combatFinished = true;
            if (this.fakeCombat) {
                // Restore player endurance to original :
                let epToRestore = this.originalPlayerEndurance - state.actionChart.currentEndurance;
                // Apply the factor
                epToRestore = Math.floor(this.fakeRestoreFactor * epToRestore);
                // If you call this, the endurance on the UI is not updated
                // state.actionChart.increaseEndurance( epToRestore );
                actionChartController.increaseEndurance(epToRestore);
            }
        }
    }

    /**
     * Returns true if the combat is finished?
     */
    public isFinished(): boolean {
        // return this.endurance === 0 || state.actionChart.currentEndurance === 0;
        return this.combatFinished;
    }

    /**
     * Returns true if the combat can be eluded right now
     */
    public canBeEluded(): boolean {
        if (this.eludeTurn < 0 || this.isFinished()) {
            return false;
        }
        if (this.turns.length < this.eludeTurn) {
            return false;
        }
        if (this.maxEludeTurn >= 0 && this.turns.length > this.maxEludeTurn) {
            return false;
        }
        if (this.eludeEnemyEP > 0 && this.endurance > this.eludeEnemyEP) {
            return false;
        }
        return true;
    }

    /**
     * Returns the number on endurance points lost by the player on this combat
     */
    public playerEnduranceLost(): number {
        let lost = 0;
        for (let i = 0, len = this.turns.length; i < len; i++) {
            const turn = this.turns[i];
            if (turn.loneWolf === COMBATTABLE_DEATH) {
                lost += state.actionChart.getMaxEndurance();
            } else {
                lost += turn.loneWolf;
            }
        }
        return lost;
    }

    /**
     * Returns the number on endurance points lost by the enemy on this combat
     */
    public enemyEnduranceLost(): number {
        let lost = 0;
        for (let i = 0, len = this.turns.length; i < len; i++) {
            const turn = this.turns[i];
            if (turn.enemy === COMBATTABLE_DEATH) {
                lost += this.originalEndurance;
            } else {
                lost += turn.enemy;
            }
        }
        return lost;
    }

    /**
     * Returns true if the player can NOT use any weapon on the current turn
     */
    public noWeaponCurrentTurn(): boolean {
        if (this.noWeaponTurns < 0) {
            // All turns no weapon
            return true;
        }

        // No weapon if we still on a "No weapon" turn
        return this.noWeaponTurns > this.turns.length;
    }

    /**
     * The applicable XXX-Surge discipline in this combat
     * @returns The applicable XXX-Surge discipline (GndDiscipline.KaiSurge or MgnDiscipline.PsiSurge). null if no XXX-surge is applicable
     */
    public getSurgeDiscipline(): string {
        if (state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge) && !this.noKaiSurge) {
            return GndDiscipline.KaiSurge;
        } else if (state.actionChart.hasMgnDiscipline(MgnDiscipline.PsiSurge) && !this.noPsiSurge) {
            return MgnDiscipline.PsiSurge;
        }
        return null;
    }

    /**
     * The full bonus for the XXX-Surge discipline on this combat, with any multiplier applied
     * @param surgeDisciplineId Discipline applied in this combat (GndDiscipline.KaiSurge or MgnDiscipline.PsiSurge)
     * @returns The XXX-Surge CS bonus
     */
    public getFinalSurgeBonus(surgeDisciplineId: string): number {
        if (!surgeDisciplineId) {
            return 0;
        }
        const surgeBonus = (surgeDisciplineId === GndDiscipline.KaiSurge ? this.kaiSurgeBonus : this.psiSurgeBonus);
        return (surgeBonus ? surgeBonus : Combat.defaultSurgeBonus(surgeDisciplineId)) * this.mindblastMultiplier;
    }

    /**
     * The full bonus for Mindblast on this combat, with any multiplier applied
     * @returns The Mindblast CS bonus
     */
    public getFinalMindblastBonus(): number {
        return (this.mindblastBonus ? this.mindblastBonus : Combat.defaultMindblastBonus()) * this.mindblastMultiplier;
    }

    /**
     * Returns the number of EP loss by turn when using XXX-Surge
     * @param surgeDisciplineId Discipline applied in this combat (GndDiscipline.KaiSurge or MgnDiscipline.PsiSurge)
     * @returns EP loss for each turn
     */
    public static surgeTurnLoss(surgeDisciplineId: string): number {
        if (surgeDisciplineId === GndDiscipline.KaiSurge) {
            return 1;
        } else {
            // MgnDiscipline.PsiSurge

            if (state.actionChart.hasMgnDiscipline(MgnDiscipline.PsiSurge) &&
                state.actionChart.getDisciplines(BookSeriesId.Magnakai).length >= 9) {
                // See defaultPsiSurgeBonus comment
                return 1;
            } else {
                return 2;
            }
        }
    }

    /**
     * Returns the minimum Endurance Points to use the Psi-Surge / Kai-Surge
     * @param surgeDisciplineId Discipline applied in this combat (GndDiscipline.KaiSurge or MgnDiscipline.PsiSurge)
     * @returns Minimum EP to use discipline
     */
    public static minimumEPForSurge(surgeDisciplineId: string): number {
        if (surgeDisciplineId === GndDiscipline.KaiSurge) {
            return 6;
        } else {
            // MgnDiscipline.PsiSurge

            if (state.actionChart.hasMgnDiscipline(MgnDiscipline.PsiSurge) &&
                state.actionChart.getDisciplines(BookSeriesId.Magnakai).length >= 9) {
                // See defaultPsiSurgeBonus comment
                return 4;
            } else {
                return 6;
            }
        }
    }

    /**
     * Get the default Psi-Surge bonus
     * @param surgeDisciplineId Discipline applied in this combat (GndDiscipline.KaiSurge or MgnDiscipline.PsiSurge)
     * @returns Default +CS bonus
     */
    public static defaultSurgeBonus(surgeDisciplineId: string): number {
        if (surgeDisciplineId === GndDiscipline.KaiSurge) {
            return +8;
        } else {
            // MgnDiscipline.PsiSurge
            /*
                Magnakai / Psi-Surge:
                When using their psychic ability to attack an enemy, Archmasters may add 6 points to their COMBAT SKILL instead of the usual 4 points.
                For every round in which Psi-surge is used, Archmasters need only deduct 1 ENDURANCE point. When using the weaker psychic
                attack—Mindblast—they may add 3 points to their COMBAT SKILL without loss of ENDURANCE points. Archmasters cannot use Psi-surge if their
                ENDURANCE score falls to 4 points or below.
            */
            if (state.actionChart.hasMgnDiscipline(MgnDiscipline.PsiSurge) &&
                state.actionChart.getDisciplines(BookSeriesId.Magnakai).length >= 9)
            {
                return +6;
            } else {
                return +4;
            }
        }
    }

    /**
     * Get the default Mindblast bonus
     * @returns Default +CS bonus
     */
    public static defaultMindblastBonus(): number {
        if (state.actionChart.hasGndDiscipline(GndDiscipline.KaiSurge)) {
            return +4;
        } else if (state.actionChart.hasMgnDiscipline(MgnDiscipline.PsiSurge) && state.actionChart.getDisciplines(BookSeriesId.Magnakai).length >= 9) {
            // See defaultPsiSurgeBonus comment
            return +3;
        } else {
            return +2;
        }
    }

}
