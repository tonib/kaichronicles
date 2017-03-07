# Mechanics

This is a brief of the books mechanics rules. They are stored at mechanics-XXX.xml
file, where XXX is the book number

General struture:

```xml
<!-- Ex: Mechanics for book 1 -->
<mechanics book="1">
    
    <translated-images>
        <!-- Here goes the list of translated images (usually images that 
             contain texts) -->
        <image>map.png</image>
        ...
    </translated-images>

    <sections>
        <!-- Here goes the list of sections that must to be mechanized -->

        <section id="sectXXX">
            <!-- Here goes the rules for the section with id "sectXXX" -->
        </section>

        <section id="sectYYY">
            ...
        </section>
        ...
    </sections>

</mechanics>
```

The "translated-images" tag is used to determine what images should be searched on the
current language book. Images that are not contained on this list will be get from the
english images.

## Expressions

The engine requires to evaluate text expressions. The expressions will have the C / Java
syntax. Example:

```xml
<test not="true" expression="[MONEY] >= 20">
    <choiceState section="sect10" set="disabled" />
</test>
```

There are some keywords that can be used on expressions. They have the following meanings:

* **[RANDOM]**: The value of the last random table value picked
* **[MONEY]**: The current amount of money
* **[BACKPACK-ITEMS-CNT-ON-SECTION]**: The current count of available backpack items 
  on the section
* **[WEAPON-ITEMS-CNT-ON-SECTION]**: The current count of available weapons on the section.
  Special items that are weapons too are ignored
* **[BACKPACK-ITEMS-CNT-ON-ACTIONCHART]**: The current count of backpack items on the
  action chart
* **[WEAPON-ITEMS-CNT-ON-ACTIONCHART]**: The current count of weapons on the action chart.
  Special items that are weapons too are ignored
* **[WEAPONLIKE-CNT-ON-ACTIONCHART]**: The current count of weapons on the action chart.
  Special items that are weapons too are included
* **[ENDURANCE]**: The current endurance points
* **[MAXENDURANCE]**: The maximum endurance points
* **[COMBATSENDURANCELOST]**: The number of endurance points lost by Lone Wolf on combats on 
the current section
* **[COMBATSENEMYLOST]**: The number of endurance points lost by the enemies on combats on 
the current section
* **[COMBATSDURATION]**: The sum of turns of all combats on the section (combat duration)
* **[MEALS]**: Number of meals on the action chart
* **[KAILEVEL]**: Current number of Kai disciplines of the player
* **[ORIGINALCOMBATSKILL]**: The original combat skill (without modifiers)

## Rules description
Description of the rules usage:

### setSkills
Game setup: The player selects the initial Endurance and Combat Skill

### setDisciplines
Game setup: The player selects the Kai disciplines

### chooseEquipment
Game setup: Choose equipment. Property "en-text" is the text to show on the UI ("Pick X objects
before continue")

### pick (execute once only)
```xml
<pick objectId="magicspear" />
<pick class="money" count="[RANDOM] + 5" />
```
Pick an object. If the object cannot be picked (ex, the backpack is full), the object
will be available on the section. 
* **objectId**: The identifier of the object to pick.
* **class**: If you are going to pick meals (="meal") or money (="money")
* **count**: Only if class is "meal" or "money". Expression with the number of coins / meals
  to pick

### randomTable (has state) / case / randomTableIncrement
```xml
<randomTable index="0" zeroAsTen="true" >
    <pick class="money" count="[RANDOM]" />
</randomTable>

<randomTable>
    <case value="0">
        <choiceState section="sect53" set="enabled" />
    </case>
    <case from="1" to="2">
        <choiceState section="sect274" set="enabled" />
    </case>
    <case from="3" to="9">
        <choiceState section="sect316" set="enabled" />
    </case>
</randomTable>

<test hasDiscipline="sixthsns">
    <randomTableIncrement increment="+2" />
</test>
```

The "randomTable" explains what to do when a random table link is clicked. When the link
is clicked, the inner rules to this tag will be execute. When the link is clicked, 
the number got will be saved as state of the rule.

The property "index" is needed only if there is more than one random table link on the
section. It will select the index (zero based) of the random table link to which it refers.

If the property "zeroAsTen" is "true", the zero value will be returned as ten.

The "case" rules are executed conditionally for the random number got. Other rules than
"case" are always executed. 

The "randomTableIncrement" will add a bonus to the random value picked

### test
```xml
<test not="true" hasDiscipline="anmlknsp">
    <choiceState section="sect144" set="disabled" />
</test>
```
This is used to execute rules conditionally. It will test a condition, and, if it's true,
it will run the inner rules to this tag.

If there is more than one condition on the tag, if any of them is true, the inner rules
will be executed.

* **hasDiscipline="disciplineId1|disciplineId2|...**: Do the player has any of the disciplines?
* **hasObject="objectId1|objectId2|...**: Do the player carry any of the objects?
* **expression="Java expression"**: Is the expression true?
* **sectionVisited="sectionId1|sectionId1|..."**: Has some of the sections been visited?
* **currentWeapon="weaponId"**: Is this the current weapon?
* **combatsWon="true"**: Have been won all combats on this section?
* **combatsActive="true"**: Do some combat still active?
* **bookLanguage="language code (en/es)"**: Is this the current book language?
* **weaponskillActive="true"**: Has the player Weaponskill with the current weapon?
* **not="true"**: This will negate the current test. So if all of these conditions are false,
  the inner rules will be executed
* **isChoiceEnabled="sectionId"**: Is the choice for the given section enabled?

### choiceState
```xml
<section id="sect23">
    <test not="true" hasDiscipline="anmlknsp">
        <choiceState section="sect144" set="disabled" />
    </test>
    <test hasDiscipline="anmlknsp">
        <choiceState section="sect295" set="disabled" />
    </test>
</section>
```
Enable or disable section choices
* **section**: The section id to enable/disable. "all" for all section choices
* **set**: "enabled" to enable the choice. "disabled" to disable.

### object
```xml
<object objectId="laumspurpotion" />
<object objectId="sword" price="4" unlimited="true" />
```
Make an object available on the section. The player will can pick / buy it.
* **objectId**: The available object id 
* **price**: If it's set, the price to buy the object (not free)
* **unlimited="true"**: There is an unlimited number of objects of this class on the section

### sell
```xml
<sell objectId="sword" price="3" />
```
This will allow to the player to sell a class of objects by a given price
* **objectId**: The object id you can sell
* **price**: The money got by selling the object

### resectSectionState
```xml
<resectSectionState sectionId="sect152" />
```
This will clear the state of the given section. Usefull if the player can return to that
section, and there are rules with state there that must to be reexecuted

### meal
```xml
<meal huntDisabled="true" />
```
The player must to have a meal on this section. If the attribute "huntDisabled" is "true"
the player will not be allowed to use the hunting discipline on this meal

### huntStatus
```xml
<huntStatus enabled="false" />
```
This will enable or disable the hunting on meals until new advice. This will be used
on map zones where there is no food (deserts, etc)

### combat
```xml
<combat noMindblast="true" mindforceEP="-2" eludeTurn="1" />
```

The combat tag add modifiers to some combat of the current section. It can have
the following properties:
* **index="number"**: Index (zero based) of the combat to which it refers
* **combatSkillModifier="bonus"**: Bonus (positive or negative) for Lone Wolf combat skill
* **mindforceCS="-number"**: Bonus (negative) to the Lone Wolf combat skill due to the enemy
  Mindblast. It will not be applied if the player as Mindshield
* **mindforceEP="-number"**: Endurance points lost by LW each turn, due to the enemy Mindblast.
  It will not be applied if the player as Mindshield
* **noMindblast="true"**: The enemy is immune to Mindblast
* **mindblastBonus="number"**: Special CS bonus to apply for Mindblast discipline on this combat
* **noWeapon="true"**: Lone Wolf cannot use any weapon on this combat
* **eludeTurn="number"**: Turn number after which LW can elude the combat
* **dammageMultiplier="number"**: LW dammage multiplier
* **enemyMultiplier="number"**: Enemy dammage multiplier
* **fake="true"**: This is a fake combat. When it's finished, LW endurance points lost will be restored
* **restoreFactor="floatNumber"**: Only applies if fake="true". Factor of the EP lost to restore after the combat.
  Default is 1.0 (100% of the EP lost)
* **enemyTurnLoss="-number"** Extra E.P. lost by the enemy each turn
* **turnLoss="-number"** Extra E.P. lost by LW each turn

TODO: Continue here

### disableCombats
```xml
<disableCombats disabled="false" />
```
By default disables all section combats. If the optional property "disabled" is set to "true", 
all section combats will be re-enabled

### saveInventoryState / restoreInventoryState
```xml
<saveInventoryState restorePoint="book4sect10Inventory" />
<restoreInventoryState restorePoint="book4sect10Inventory" />
```
It can be used when player loses all his objects, and they can be found after. "saveInventoryState"
stores the player current inventory state. When the "restoreInventoryState" rule is executed
all the objects stored will be re-added to the player inventory. "restorePoint" property
is used to identify the place on the book where it was lost the inventory (they can be more
than one).

### choiceSelected
```xml
<choiceSelected section="sect187">
    <pick objectId="bracelet" />
</choiceSelected>
```
Contains the rules to execute when a choice is selected. "section" property can be the
choice section destination or "all" for any choice on the section

### registerGlobalRule / unregisterGlobalRule
```xml
<section id="sect63">
    <!-- Player will lose 2 E.P. each section until a Laumspur Potion is used -->
    <registerGlobalRule id="book5sect63">
        <onObjectUse objectId="laumspurmeal|laumspurpotion|laumspurpotion4|redpotionlaumspur">
            <unregisterGlobalRule id="book5sect63" />
        </onObjectUse>
        <choiceSelected section="all">           
            <endurance count="-2" />
        </choiceSelected>
    </registerGlobalRule>
</section>
```
"registerGlobalRule" registers a set of rules that will be executed each section.
These rules has an "id", and they will be executed each section until the rule 
"unregisterGlobalRule" is executed with the same "id" property

### objectUsed
```xml
<objectUsed objectId="laumspurpotion|laumspurpotion4|redpotionlaumspur">
    <unregisterGlobalRule id="book5sect63" />
</objectUsed>
```
Event handler for an object use. If some of the objects on the "objectId" property is used
on this section, the chilren rules will be executed

### numberPicker
```xml
<numberPicker 
    en-text="Choose the number of Gold Crowns you are going to throw"
    es-text="Elige el número de Coronas de Oro que vas a lanzar"
    min="1" 
    money="true"
    />
<numberPicker enabled="false" />
```
Add a control on the UI to select a number


### special sections

There are sections (or parts of them) that cannot be described by the game rules.
In that case, they are specific implementations:

* **book2Sect238**: Cartwheel game
* **book2sect308**: Portholes game
* **book3sect88**: Javek venom test

## How rules are executed

If you are going to use the rules in you application, here come some tips about how to
implement them:

### Initial rendering

The algorithm to display a section is:

1. Render the section from the Project Aon book XML to an internal representation
2. Apply the section rules. This can modify this internal representation
3. Display the final result to the player

### Handle events

There are some event you must handle, and apply the associated rules for them:

* Combat events (turn execution, combat win / loss, etc)
* Inventory events (pick / drop objects)
* Choice selections
* Random table usage

### Rules state

There are some rules that have a state to record. Others, don't. 

#### Rules to execute once

There are some rules that have to be executed a single time, not each time the section
is rendered:

* Endurance loss
* Pick / drop some object
* etc

#### Rules with advanced state

There are rules that need to store a state:

* Meals: The meal has been done?
* Random table pick: Has been done? What result we got?
* etc





