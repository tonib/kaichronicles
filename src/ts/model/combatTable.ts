
/**
 * Combat result for death
 */
const COMBATTABLE_DEATH = "D";

/**
 * The combat table
 */
const combatTable = {

    /**
     * Combat table results when the combat ratio is <= 0
     */
    tableBelowOrEqualToEnemy: {

        // Random table result = 1
        1: {
            0: [ 3 , 5 ], // Combat ratio 0 => E: 3 / LW: 5
            1: [ 2 , 5 ], // Combat ratio -1 / -2 => E: 2 / LW: 5
            2: [ 1 , 6 ], // Combat ratio -3 / -4, => E: 1 / LW: 6
            3: [ 0 , 6 ], // ...
            4: [ 0 , 8 ],
            5: [ 0 , COMBATTABLE_DEATH],
            6: [ 0 , COMBATTABLE_DEATH ],
        },

        // Random table result = 2
        2: {
            0: [ 4 , 4 ],
            1: [ 3 , 5 ],
            2: [ 2 , 5 ],
            3: [ 1 , 6 ],
            4: [ 0 , 7 ],
            5: [ 0 , 8 ],
            6: [ 0 , COMBATTABLE_DEATH ],
        },

        // Random table result = 3
        3: {
            0: [ 5 , 4 ],
            1: [ 4 , 4 ],
            2: [ 3 , 5 ],
            3: [ 2 , 5 ],
            4: [ 1 , 6 ],
            5: [ 0 , 7 ],
            6: [ 0 , 8 ],
        },

        // Random table result = 4
        4: {
            0: [6 , 3],
            1: [5 , 4],
            2: [4 , 4],
            3: [3 , 5],
            4: [2 , 6],
            5: [1 , 7],
            6: [0 , 8],
        },

        // Random table result = 5
        5: {
            0: [7 , 2],
            1: [6 , 3],
            2: [5 , 4],
            3: [4 , 4],
            4: [3 , 5],
            5: [2 , 6],
            6: [1 , 7],
        },

        // Random table result = 6
        6: {
            0: [8 , 2],
            1: [7 , 2],
            2: [6 , 3],
            3: [5 , 4],
            4: [4 , 5],
            5: [3 , 6],
            6: [2 , 6],
        },

        // Random table result = 7
        7: {
            0: [9 , 1],
            1: [8 , 2],
            2: [7 , 2],
            3: [6 , 3],
            4: [5 , 4],
            5: [4 , 5],
            6: [3 , 5],
        },

        // Random table result = 8
        8: {
            0: [10 , 0],
            1: [9  , 1],
            2: [8  , 1],
            3: [7  , 2],
            4: [6  , 3],
            5: [5  , 4],
            6: [4  , 4],
        },

        // Random table result = 9
        9: {
            0: [11 , 0],
            1: [10 , 0],
            2: [9  , 0],
            3: [8  , 0],
            4: [7  , 2],
            5: [6  , 3],
            6: [5  , 3],
        },

        // Random table result = 0
        0: {
            0: [12 , 0],
            1: [11 , 0],
            2: [10 , 0],
            3: [9  , 0],
            4: [8  , 0],
            5: [7  , 0],
            6: [6  , 0],
        },
    },

    /**
     * Combat table results when the combat ratio is > 0
     */
    tableAboveEnemy: {

        // Random table result = 1
        1: {
            1: [4 , 5], // Combat ratio +1 / +2 => E: 4 , LW: 5
            2: [5 , 4], // Combat ratio +3 / +4 => E: 5 , LW: 4
            3: [6 , 4], // ...
            4: [7 , 4],
            5: [8 , 3],
            6: [9 , 3], // Combat ratio +11 or more if NO extended table (+11 / +12 if extended table)
            7: [10, 2], // EXTENDED TABLE STARTS HERE (Combat ratio +13 / +14)
            8: [11, 2],
            9: [12, 1],
            10: [14, 1],
            11: [16, 1],
            12: [18, 0],
            13: [20, 0],
            14: [22, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 2
        2: {
            1: [5  , 4],
            2: [6  , 3],
            3: [7  , 3],
            4: [8  , 3],
            5: [9  , 3],
            6: [10 , 2],
            7: [11, 2],
            8: [12, 1],
            9: [14, 1],
            10: [16, 1],
            11: [18, 0],
            12: [20, 0],
            13: [22, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 3
        3: {
            1: [6  , 3],
            2: [7  , 3],
            3: [8  , 3],
            4: [9  , 2],
            5: [10 , 2],
            6: [11 , 2],
            7: [12, 1],
            8: [14, 1],
            9: [16, 1],
            10: [18, 0],
            11: [20, 0],
            12: [22, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 4
        4: {
            1: [7 , 3],
            2: [8 , 2],
            3: [9 , 2],
            4: [10 , 2],
            5: [11 , 2],
            6: [12 , 2],
            7: [14, 1],
            8: [16, 1],
            9: [18, 0],
            10: [20, 0],
            11: [COMBATTABLE_DEATH, 0],
            12: [COMBATTABLE_DEATH, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 5
        5: {
            1: [8 , 2],
            2: [9 , 2],
            3: [10 , 2],
            4: [11 , 2],
            5: [12 , 2],
            6: [14 , 1],
            7: [16, 1],
            8: [18, 0],
            9: [20, 0],
            10: [COMBATTABLE_DEATH, 0],
            11: [COMBATTABLE_DEATH, 0],
            12: [COMBATTABLE_DEATH, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 6
        6: {
            1: [9, 2],
            2: [10, 2],
            3: [11, 1],
            4: [12, 1],
            5: [14, 1],
            6: [16, 1],
            7: [18, 0],
            8: [20, 0],
            9: [COMBATTABLE_DEATH, 0],
            10: [COMBATTABLE_DEATH, 0],
            11: [COMBATTABLE_DEATH, 0],
            12: [COMBATTABLE_DEATH, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 7
        7: {
            1: [10, 1],
            2: [11, 1],
            3: [12, 0],
            4: [14, 0],
            5: [16, 0],
            6: [18, 0],
            7: [20, 0],
            8: [COMBATTABLE_DEATH, 0],
            9: [COMBATTABLE_DEATH, 0],
            10: [COMBATTABLE_DEATH, 0],
            11: [COMBATTABLE_DEATH, 0],
            12: [COMBATTABLE_DEATH, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 8
        8: {
            1: [11, 0],
            2: [12, 0],
            3: [14, 0],
            4: [16, 0],
            5: [18, 0],
            6: [COMBATTABLE_DEATH, 0],
            7: [COMBATTABLE_DEATH, 0],
            8: [COMBATTABLE_DEATH, 0],
            9: [COMBATTABLE_DEATH, 0],
            10: [COMBATTABLE_DEATH, 0],
            11: [COMBATTABLE_DEATH, 0],
            12: [COMBATTABLE_DEATH, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 9
        9: {
            1: [12, 0],
            2: [14, 0],
            3: [16, 0],
            4: [18, 0],
            5: [COMBATTABLE_DEATH, 0],
            6: [COMBATTABLE_DEATH, 0],
            7: [COMBATTABLE_DEATH, 0],
            8: [COMBATTABLE_DEATH, 0],
            9: [COMBATTABLE_DEATH, 0],
            10: [COMBATTABLE_DEATH, 0],
            11: [COMBATTABLE_DEATH, 0],
            12: [COMBATTABLE_DEATH, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },

        // Random table result = 0
        0: {
            1: [14, 0],
            2: [16, 0],
            3: [18, 0],
            4: [COMBATTABLE_DEATH, 0],
            5: [COMBATTABLE_DEATH, 0],
            6: [COMBATTABLE_DEATH, 0],
            7: [COMBATTABLE_DEATH, 0],
            8: [COMBATTABLE_DEATH, 0],
            9: [COMBATTABLE_DEATH, 0],
            10: [COMBATTABLE_DEATH, 0],
            11: [COMBATTABLE_DEATH, 0],
            12: [COMBATTABLE_DEATH, 0],
            13: [COMBATTABLE_DEATH, 0],
            14: [COMBATTABLE_DEATH, 0],
            15: [COMBATTABLE_DEATH, 0],
        },
    },

    /**
     * Get a combat table result
     * @param combatRatio The combat ratio
     * @param randomTableValue The random table value
     * @returns Array with endurance points loses, or COMBATTABLE_DEATH. Index 0 is the
     * EP enemy loss. Index 1 is the Lone Wolf loss
     */
    getCombatTableResult(combatRatio: number, randomTableValue: number): any[] {
        /*
        var ponderatedIndex = combatRatio / 2.0;
        // check if we're using the extended CRT or not and set max column
        var maxPonderatedIndex = state.actionChart.extendedCRT ? 15 : 6;
        // Set to the right column
        if( ponderatedIndex < 0) {
            // round -4.5 to -5
            ponderatedIndex = Math.floor(ponderatedIndex);
        } else if( ponderatedIndex > 0) {
            // round 4.5 to 5
            ponderatedIndex = Math.ceil(ponderatedIndex);
        }
        // stick to min and max columns
        if( ponderatedIndex < -6 ) {
            ponderatedIndex  = -6;
        } else if( ponderatedIndex > maxPonderatedIndex ) {
            ponderatedIndex = maxPonderatedIndex;
        }
        var table;
        if( combatRatio <= 0 ) {
            table = combatTable.tableBelowOrEqualToEnemy;
            // flip the sign to select the right column
            ponderatedIndex = - ponderatedIndex;
        } else {
            table = combatTable.tableAboveEnemy;
        }
        return table[randomTableValue][ponderatedIndex];
        */

        let ponderatedIndex = combatRatio / 2.0;
        let table;
        if ( combatRatio <= 0 ) {
            table = combatTable.tableBelowOrEqualToEnemy;
            ponderatedIndex = - ponderatedIndex;
        } else {
           table = combatTable.tableAboveEnemy;
        }

        // round 4.5 to 5
        ponderatedIndex = Math.ceil(ponderatedIndex);

        // check if we're using the extended CRT or not and set max column
        const maxPonderatedIndex = state.actionChart.extendedCRT && combatRatio > 0 ? 15 : 6;
        if ( ponderatedIndex > maxPonderatedIndex ) {
            ponderatedIndex = maxPonderatedIndex;
        }

        return table[randomTableValue][ponderatedIndex];

    },
};
