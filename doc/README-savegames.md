# Savegame format

An example can be found here: [sampleSavegame.json](./sampleSavegame.json)

Savegames are JSON files. Savegames are exported by the application as a ZIP with all saved games.

Keep in mind this format could change in future.

The structure:

```javascript
{
    // Current savegame state
    "currentState": {
        // Current Action Chart state (full documentation at actionChart.ts)
        "actionChart": {
            // Original values:
            "combatSkill": 18,
            "endurance": 26,
            // Current value:
            "currentEndurance": 26,
            // Owned weapons. Weapons information can be found in objects.xml
            "weapons": [
                "sword",
                "bow"
            ],
            // Current selected weapon
            "fightUnarmed": false,
            "selectedWeapon": "sword",
            // Money
            "beltPouch": 31,
            // Number of meals (each one backpack item)
            "meals": 3,
            // Backpack items. These are object codes. Object information can be found in objects.xml
            "backpackItems": [
                "rope",
                "khetuspores",
                "baylonboughfungi",
                "silverflask",
                "silverflask"
            ],
            // Special items. These are object codes. Object information can be found in objects.xml
            "specialItems": [
                "quiver",
                "quiver",
                "map",
                "crystalexplosive",
                "goldenamulet"
            ],
            // Backpack lost?
            "hasBackpack": true,
            // Current Kai disciplines. These are the codes as they appear in the books XML. Descriptions can be found in README-mechanics.md
            "disciplines": [
                "wpnmstry",
                "curing",
                "hntmstry",
                "dvnation"
            ],
            // Weapon codes for Weaponskill. Weapons information can be found in objects.xml
            "weaponSkill": [
                "bow",
                "sword",
                "dagger",
                "broadsword",
                "spear"
            ],
            // Action Chart annotations field
            "annotations": "These are my personal annotations",
            "manualRandomTable": true,
            "extendedCRT": false,
            "yScrollPosition": 0,
            // Number of arrows in owned quivers
            "arrows": 9,
            // Adgana has ever been used?
            "adganaUsed": false,
            // Curing (+20EP) has been used in current book?
            "restore20EPUsed": false,
            // Objects stored in Kai monastery
            "kaiMonasterySafekeeping": [
                {
                    // Object id
                    "id": "money",
                    // Unused here
                    "price": 0,
                    // Unused here
                    "unlimited": false,
                    // Amount: Only for quivers (=number of arrows) and money
                    "count": 2,
                    "useOnSection": false
                },
                {
                    "id": "quiver",
                    "price": 0,
                    "unlimited": false,
                    "count": 3,
                    "useOnSection": false
                },
                {
                    "id": "lantern",
                    "price": 0,
                    "unlimited": false,
                    "count": 0,
                    "useOnSection": false
                }
            ]
        },
        // Current book number
        "bookNumber": 12,
        // Current language
        "language": "es",

        // Current book sections state (bookSectionStates.ts for full documentation)
        "sectionStates": {
            "currentSection": "equipmnt",

            // ...
            // Here the is one object for each visited section. Key is the section id as it appears in the XML, and the value
            // is the state
            "tssf": {
                    // See sectionState.ts for details
                    "objects": [],
                    "sellPrices": [],
                    "combats": [],
                    "combatEluded": false,
                    "executedRules": {
                        "endurance[count='+[MAXENDURANCE]']": true,
                        "drop[objectId='map']": true
                    },
                    "healingExecuted": true,
                    "numberPickersState": {
                        "actionFired": null
                    }
                },
            // ...

            // Hunt is allowed in current book state?
            "huntEnabled": true,

            // States for special sections
            "otherStates": {
                "book6sect26TargetPoints": null,
                "book6sect284": null,
                "book6sect340": null,
                "book9sect91": null
            },

            // Global rules to apply on each section
            "globalRulesIds": []
        }
    },

    // State for previous played books. Only the Action Chart is stored. Key is the book number, and the value is 
    // the Action Chart object JSON (full documentation at actionChart.ts)
    "previousBooksState": {
        "11": "{\"combatSkill\":18,\"endurance\":26,\"currentEndurance\":28,\"weapons\":[\"sword\",\"bow\"],\"fightUnarmed\":false,\"selectedWeapon\":\"sword\",\"beltPouch\":14,\"meals\":3,\"backpackItems\":[\"rope\",\"lantern\",\"khetuspores\",\"baylonboughfungi\",\"silverflask\",\"silverflask\"],\"specialItems\":[\"quiver\",\"map\",\"quiver\"],\"hasBackpack\":true,\"disciplines\":[\"wpnmstry\",\"curing\",\"hntmstry\"],\"weaponSkill\":[\"bow\",\"sword\",\"dagger\",\"broadsword\"],\"annotations\":\"\",\"manualRandomTable\":true,\"extendedCRT\":false,\"yScrollPosition\":323.6363525390625,\"arrows\":9,\"adganaUsed\":false,\"restore20EPUsed\":false,\"kaiMonasterySafekeeping\":[]}"
    }
}

```
