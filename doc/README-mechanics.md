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

    <!-- Here goes the list of sections that must to be mechanized 
        The "count" attribute is optional. It's the number of sections on the book, 
        and the default value is "350"
    -->
    <sections count="400">
        
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

* **[RANDOM]**: The value of the last random table value picked (not for combat random values)
* **[RANDOMxxx]**: Ex. "[RANDOM2], The value of the xxx-th random table value picked 
  (not for combat random values), where xxx is the random table index (0=first, 1=second,...)
* **[COMBATRANDOM]**: The value of the last random table value picked on combats in this section
* **[MONEY]**: The current amount of money on the action chart (Belt pouch)
* **[MONEY-ON-SECTION]**: The current amount of money available on the section
* **[BACKPACK-ITEMS-CNT-ON-SECTION]**: The current count of available backpack items 
  on the section
* **[BACKPACK-ITEMS-CNT-ON-ACTIONCHART]**: The current count of backpack items on the
  action chart
* **[WEAPON-ITEMS-CNT-ON-SECTION]**: The current count of available weapons on the section.
  Special items that are weapons too are ignored
* **[WEAPON-ITEMS-CNT-ON-ACTIONCHART]**: The current count of weapons on the action chart.
  Special items that are weapons too are ignored
* **[WEAPONLIKE-CNT-ON-SECTION]**: The current count of weapons on the action chart.
  Special items that are weapons too are included
* **[WEAPONLIKE-CNT-ON-ACTIONCHART]**: The current count of weapons on the action chart.
  Special items that are weapons too are included
* **[BOW-CNT-ON-SECTION]**: The current count of bows on the action chart.
  Special items that are bows too are included
* **[BOW-CNT-ON-ACTIONCHART]**: The current count of bows on the action chart.
  Special items that are bows too are included
* **[SPECIAL-ITEMS-ON-SECTION]**: The current count of special items on the action chart.
* **[SPECIAL-ITEMS-ON-ACTIONCHART]**: The current count of special items on the action chart.
* **[ENDURANCE]**: The current endurance points
* **[MAXENDURANCE]**: The maximum endurance points
* **[COMBATSENDURANCELOST]**: The number of endurance points lost by Lone Wolf on combats on 
the current section
* **[COMBATSENEMYLOST]**: The number of endurance points lost by the enemies on combats on 
the current section
* **[COMBATSDURATION]**: The sum of number of turns of all combats on the section (combat duration)
* **[MEALS]**: Number of meals on the action chart
* **[KAILEVEL]**: Current number of Kai disciplines of the player
* **[ORIGINALCOMBATSKILL]**: The original combat skill (without modifiers)
* **[ARROWS]**: Current number of arrows on the quiver
* **[BOWBONUS]** : Bonus for bow usage: It's Weaponmastery bonus + bow object bonus (see 
"silverbowduadon" object). It will be -4 if the player has no bow
* **[NUMBERPICKER]**: The selected number on the "numberPicker" UI

## Codes for Magnakai disciplines

These are the codes for each Magnakai discipline, used by the mechanics, as they appear on the XMLs:

* **Weaponmastery**: wpnmstry
* **Animal Control**: anmlctrl
* **Curing**: curing
* **Invisibility**: invsblty
* **Huntmastery**: hntmstry
* **Pathsmanship**: pthmnshp
* **Psi-surge**: psisurge
* **Psi-screen**: psiscrn
* **Nexus**: nexus
* **Divination**: dvnation

## Codes for Grand Master disciplines

These are the codes for each Grand Master discipline, used by the mechanics, as they appear on the XMLs:

* **Grand Weaponmastery**: wpnmstry
* **Animal Mastery**: anmlmstr
* **Deliverance (Advanced Curing)**: deliver
* **Assimilance (Advanced Invisibility)**: assimila
* **Grand Huntmastery**: hntmstry
* **Grand Pathsmanship**: pthmnshp
* **Kai-surge**: kaisurge
* **Kai-screen**: kaiscrn
* **Grand Nexus**: nexus
* **Telegnosis (Advanced Divination)**: gnosis
* **Magi-magic**: magi
* **Kai-alchemy**: alchemy

## Rules description
Description of the rules usage:

### section
```xml
<section id="equipmnt" pickMaximum="2" >
...
</section>
```
"section" is the root for rules to be executed on a given section. "id" is the section id.

Property "pickMaximum" is optional. It's the maximum number of object you can pick on the section.
Objects are grouped by it's id. So if there are 2 meals, if you pick them both, it counts as a one object 
picked. This is for "Equipment" sections, where meals and fireseeds are grouped.

### setSkills
Game setup: The player selects the initial Endurance and Combat Skill

### grandMasterUpgrade
Allow to upgrade stats at the Grand Master beginning

### restoreDeliveranceUse (execute once only)
Magnakai and later: Action Chart button to restore +X EP after Y days will available again

### setDisciplines
Game setup: The player selects the Kai disciplines

### chooseEquipment
Game setup: Choose equipment. Property "en-text" is the text to show on the UI ("Pick X objects
before continuing")

### pick (execute once only)
```xml
<pick objectId="magicspear" />
<pick class="money" count="[RANDOM] + 5" />
<pick class="arrow" count="-1" />
<pick class="money" count="20" currency="kika" />
```
Pick an object. If the object cannot be picked (ex, the backpack is full), the object
will be available on the section. 
* **objectId**: The identifier of the object to pick.
* **class**: This for counters. If you are going to pick meals (="meal") money (="money") or "arrow"
* **count**: Only if class is "meal", "money" or "arrow". Expression with the number of coins / meals
  to pick
* **index="number"** Required, for ugly reasons, when there are two o more pick rules with the same object id on a section
* **currency="currencyId"** Optional, and only for class="money". Picked coins currency, default is "crown". 
  Values can be "crown", "lune" or "kika".

### drop (execute once only)
```xml
<drop objectId="fireseed" />
<drop objectId="allmeals" />
<!-- Drop largerope OR rope -->
<drop objectId="largerope|rope" />
<!-- Delete the items you have listed fourth, fifth, AND sixth on the Backpack section -->
<drop backpackItemSlots="4|5|6" />
<!-- Delete first AND last Special item -->
<drop specialItemSlots="1|last" />
```
Drop an object, or a set of objects. This rules is not used for counters (money, meals and arrows). If you want to
decrease a counter, use the "pick" rule. The "objectId" can be one or more object Id, or one of the following:
* **allweapons**: Drop all weapons (it does not drop special items weapons)
* **allweaponlike**: Drop all weapons and special items weapons
* **backpackcontent**: Drop all backpack content, but not the backpack
* **currentweapon**: Drop the current hand-to-hand weapon
* **allspecial**: Drop all the special items
* **allmeals**: Drop all meals
* **all**: Drop all (weapons, backpack, special items, and money)
* **allobjects** Drop all objects (weapons, special items, and backpack content, but not the backpack itself)

If you set more than one object id, the first one owned by the player will be dropped

The property "backpackItemSlots" and specialItemSlots is used to drop objects on some given Backpack / Special Items positions. They
can contain the index positions (1-based), or "last" for the last item

If the optional property "restorePoint" is specified, the dropped item will can be restored with the rule "restoreInventoryState", with
the given restore point id.

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
<randomTableIncrement increment="+[BOWBONUS]" />

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

The "randomTableIncrement" will add a bonus to the random value picked. They are cumulative: If they are
more than one randomTableIncrement executed, all the increments will be added. For bow, use the [BOWBONUS].
This will add the combat skill bonus, plus bow object bonus

A "randomTableIncrement" with a increment="reset" will reset to zero any previous increment.

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
* **currentWeapon="weaponId1|weaponId2|..."**: Is the current weapon (hand-to-hand) some of these kinds?
* **combatsWon="boolean"**: Have been won all combats on this section (or not)?
* **combatsActive="true"**: Do some combat still active (not won and not eluded)?
* **bookLanguage="language code (en/es)"**: Is this the current book language?
* **sectionContainsText="text"**: Does the current section contain this text?
* **weaponskillActive="true"**: Has the player "Weaponskill" (current book discipline, no loyalty bonus) with the current weapon?
* **not="true"**: This will negate the current test. So if all of these conditions are false,
  the inner rules will be executed
* **isChoiceEnabled="sectionId"**: Is the choice for the given section enabled?
* **hasWeaponType="weaponType1|weaponType2|..."**: The player has some weapon of some of the given types?
* **hasCircle="loreCircleId"**: The player has this Lore Circle (see loreCircle.ts for codes)
* **hasWeaponskillWith="weaponType"** : The player has "Weaponskill" (current book discipline, no loyalty bonus) with the given weapon type?
* **canUseBow="boolean"** : The player has a bow and one arrow (or not)?
* **currentWeaponSpecial="boolean"** : Current weapon is a Special Item (or not)?
* **isGlobalRuleRegistered="globalRuleId"** : A global rule with a given id is currently registered?
* **objectOnSection="objectId1|objectId2|..."**: Some of these objects is available on the current section?
* **pickedSomethingOnSection="sectionId"**: Did the player pick something on the given section?

To make AND conditions, embed test tags. Example: Enable a choice if the player has the lantern, or torch AND tinderbox:
```xml
<!-- Lantern, OR torch and tinderbox -->
<choiceState section="sect51" set="disabled" />
<test hasObject="torch">
    <test hasObject="tinderbox">
        <choiceState section="sect51" set="enabled" />
    </test>
</test>
<test hasObject="lantern">
    <choiceState section="sect51" set="enabled" />
</test>
```

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
<object objectId="laumspurpotion" useOnSection="true" />
<object objectId="sword" price="4" unlimited="true" />
<object objectId="meal" index="0" />
<object objectId="meal" index="1" />
```
Make an object available on the section. The player will can pick / buy it.
* **objectId**: The available object id 
* **price**: If it's set, the price to buy the object (not free)
* **unlimited="true"**: There is an unlimited number of objects of this class on the section
* **index="number"** Required, for ugly reasons, when there are two o more objects with the same object id on a section
* **useOnSection="true"**: If true, the player will can use the object without picking it

### sell
```xml
<sell objectId="sword" price="3" />
<sell class="special" except="greycrystalring" price="8" />
```
This will allow to the player to sell a class of objects by a given price
* **objectId**: The object id you can sell
* **class="special"** You can sell any Special Item object
* **except="objectId1|objectId2|..."** Only applies if "class" was specified. Objects id that you cannot sell
* **price**: The money got by selling the object

### resetSectionState
```xml
<resetSectionState sectionId="sect152" />
```
This will clear the state of the given section. Usefull if the player can return to that
section, and there are rules with state there that must to be reexecuted

### meal
```xml
<meal huntDisabled="true" price="1" />
```
The player must to have a meal on this section.

If the attribute "huntDisabled" is "true" the player will not be allowed to use any hunting discipline, of any book series, on this 
meal.
If the attribute "price" is set with a integer value, this will allows to buy a meat for the given price.

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
* **combatSkillModifier="bonus"**: Absolute bonus (positive or negative) for Lone Wolf combat skill on this combat
* **combatSkillModifierIncrement="bonus"**: Bonus increment (positive or negative) for Lone Wolf combat skill on this combat
* **mindforceCS="-number"**: Bonus (negative) to the Lone Wolf combat skill due to the enemy
  Mindblast. It will not be applied if the player has Mindshield / Psi-screen
* **mindforceEP="-number"**: Endurance points lost by LW each turn, due to the enemy Mindblast.
  It will not be applied if the player has Mindshield / Psi-screen
* **noMindblast="true"**: The enemy is immune to Mindblast
* **noPsiSurge="true"**: The enemy is immune to Psi-Surge
* **mindblastBonus="number"**: Special CS bonus to apply for Mindblast discipline on this combat
* **mindblastMultiplier="number"**: CS multiplier to apply to Mindblast/Psi-Surge/Kai-Surge attacks this combat
* **psiSurgeBonus="number"**: Special CS bonus to apply for Psi-Surge discipline on this combat
* **kaiSurgeBonus="number"**: Special CS bonus to apply for Kai-Surge discipline on this combat
* **noWeapon="boolean|number"**: If true, Lone Wolf cannot use any weapon on this combat. If a number, LW cannot use any weapon for 
  that many turns
* **mentalOnly="true"**: Lone Wolf cannot use any physical bonuses on this combat (any object bonus)
* **eludeTurn="number"**: Turn number after which LW can elude the combat
* **maxEludeTurn="number"**: Turn number after which LW cannot elude the combat anymore
* **eludeEnemyEP="number"**: LW can elude the combat once the enemy EP is at the value or below. eludeTurn has to be set
* **enemyImmuneTurns="number"**: Turns during which the enemy will suffer no damage
* **immuneTurns="number"**: Turns during which LW will suffer no damage
* **dammageMultiplier="number"**: LW dammage multiplier. Can have decimals (ex. "0.5")
* **enemyMultiplier="number"**: Enemy dammage multiplier. Can have decimals (ex. "0.5")
* **fake="true"**: This is a fake combat. When it's finished, LW endurance points lost will be restored
* **restoreFactor="floatNumber"**: Only applies if fake="true". Factor of the EP lost to restore after the combat.
  Default is 1.0 (100% of the EP lost)
* **enemyTurnLoss="-number"** Extra E.P. lost by the enemy each turn. Should be negative or zero
* **turnLoss="-number"** Extra E.P. lost by LW each turn. Should be negative or zero
* **turnLossIfWounded="-number"** Extra E.P. lost by LW, if the player has been wounded on that turn. Should be negative or zero
* **bow="true"** It's a combat with bow? (false = hand-to-hand)
* **disabledObjects="objectId1|objectId2|..."** Set objects that cannot be used on this combat. "none" to enable all objects previously
  disabled.
* **permanentDammage="boolean"** EP lost by LW on this combat will be permanent?

Different combat tags with different attributes are cumulative. Different combat tags with the same attribute will
replace that value. Ex:

```xml
<!-- Cumulative effects -->
<combat noMindblast="true" />
<combat mindforceEP="-2" />
<!-- Replacement -->
<combat noMindblast="true" />
<combat noMindblast="false" />
```

The exception is "combatSkillModifierIncrement": It's always cumulative

### disableCombats
```xml
<disableCombats disabled="false" />
```
By default disables all section combats. If the optional property "disabled" is set to "false", 
all section combats will be re-enabled

### saveInventoryState / restoreInventoryState
```xml
<saveInventoryState restorePoint="book4sect10Inventory" />
<restoreInventoryState restorePoint="book4sect10Inventory" restoreWeapons="false" />
```
It can be used when player loses part of the inventory, and they can be found after. "saveInventoryState"
stores the player current inventory state. When the "restoreInventoryState" rule is executed
the objects stored will be re-added to the player inventory. "restorePoint" property
is used to identify the place on the book where it was lost the inventory (they can be more
than one).

The saveInventoryState optional property "objectsType" identifies the objects to lose / restore:
* **all**: The backpack content, the backpack itself, special items, meals and money (This is the default value)
* **weaponlike**: Weapons and weapon-like special items
* **allobjects**: The backpack content, special items and meals

The restoreInventoryState optional property "restoreWeapons" identifies if the Weapons, and weapon Special Items
should be recovered. Default value is true. If it's false, weapons are not lost, and they can be recovered after
with the same restore point.

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
"unregisterGlobalRule" is executed with the same "id" property.
You can check if a global rule is still registered with:
```xml
<test isGlobalRuleRegistered="globalruleid">...</test>
```

### objectUsed
```xml
<objectUsed objectId="laumspurpotion|laumspurpotion4|redpotionlaumspur">
    <unregisterGlobalRule id="book5sect63" />
</objectUsed>
```
Event handler for an object use. If some of the objects on the "objectId" property is used
on this section, the chilren rules will be executed

### numberPicker / numberPickerChoosed
```xml
<numberPicker 
    en-text="Choose the number of Gold Crowns you are going to throw"
    es-text="Elige el número de Coronas de Oro que vas a lanzar"
    min="1" 
    money="true"
    />
<numberPicker enabled="false" />
<numberPickerChoosed>
    <test expression="[NUMBERPICKER] == 34">
        <goToSection section="sect34" />
    </test>
    <test expression="[NUMBERPICKER] != 34">
        <toast 
            en-text="Wrong number!"
            es-text="¡Número incorrecto!" />
    </test>
</numberPickerChoosed>
<numberPickerChoosed executeAtStart="true">
    <numberPicker enabled="false" />
    <pick class="money" count="-[NUMBERPICKER]" />
    <test expression="[NUMBERPICKER] >= 3">
        <choiceState section="sect28" set="enabled" />
    </test>
    <test not="true" expression="[NUMBERPICKER] >= 3">
        <choiceState section="sect235" set="enabled" />
    </test>
</numberPickerChoosed>
```
Add a control on the UI to select a number. "numberPickerChoosed" is an optional event handler to execute when
the number is picked. If the property "executeAtStart" is true, and the number picker action button was clicked
on a previous rendering, the "numberPickerChoosed" will be executed at the section startup.

### goToSection
```xml
<numberPicker 
    en-text="Choose the number"
    es-text="Elige el número"
    min="1" max="350" 
    en-actionButton="Choose"
    es-actionButton="Elige"
    />
<numberPickerChoosed>
    <test expression="[NUMBERPICKER] == 34">
        <goToSection section="sect34" />
    </test>
    <test expression="[NUMBERPICKER] != 34">
        <toast 
            en-text="Wrong number!"
            es-text="¡Número incorrecto!" />
    </test>
</numberPickerChoosed>
```
Forces a jump to another section. "section" property specifies the section where to jump.

### currentWeapon
```xml
<currentWeapon objectId="sommerswerd" />
```
Changes the player current weapon to the set on "objectId" property

### toast
```xml
<toast 
    en-text="Wrong number!"
    es-text="¡Número incorrecto!" />
```
Display a "toast" message

### textToChoice
```xml
<textToChoice 
    text-en="turn immediately to 335"
    text-es="pasa inmediatamente al 335"
    section="sect335"
/>
```
Replaces a section text by a choice link. This could be needed when there is no link on the original Project AON XML

### kaiMonasteryStorage
```xml
<kaiMonasteryStorage />
```
Add a button to access to the Kai monastery stored objects. It can be added inside "equipmnt" sections only.

### executeOnce
```xml
<section id="sect269">
    <executeOnce>
        <!-- Order of rules is important here -->
        <test expression="[SPECIAL-ITEMS-ON-ACTIONCHART] == 0">
            <drop backpackItemSlots="1" />
        </test>
        <test not="true" expression="[SPECIAL-ITEMS-ON-ACTIONCHART] >= 4">
            <drop specialItemSlots="last" />
        </test>
        <test expression="[SPECIAL-ITEMS-ON-ACTIONCHART] >= 4">
            <drop specialItemSlots="4" />
        </test>
    </executeOnce>
</section>
```
Single rules as "drop" have state and they will not be re-executed. If you need the same behaviour on a set of rules, you can use 
"executeOnce"


### endurance (has state)
```xml
<endurance count="-2" />
```
Increase / decrease the current player endurance (not permanent)

### combatSkill (has state)
```xml
<combatSkill count="-5" toast="false" />
```
Increase / decrease the original player combat skill (permanent). 

The "toast" property is optional (default value="true"). If true, a toast will be displayed with the CS increase / decrease.

### onInventoryEvent (Event handler)
```xml
<onInventoryEvent>
    <disableCombats />
    <test currentWeapon="paidosword">
        <disableCombats disabled="false" />
    </test>
</onInventoryEvent>
```
Rules inside "onInventoryEvent" will be called when the player picks / drops some object, or the section is rendered (at the section startup).
It's not called when rules "pick" / "drop" are executed, only when the player does some action from the UI.
This rule was a big design mistake. 

### runInventoryEvent
It runs the "onInventoryEvent" event handler, if it exists on the section.

### displayIllustration
```xml
<displayIllustration section="sect131" 
    en-text="Illustration on section 131"
    es-text="Ilustración en la sección 131"
/>
```
Displays the first illustration on the "section" attribute section. "xx-text" is an option title to display with the illustration.

### use
```xml
<use objectId="vialbluepills|vialbluepills2|vialbluepills3" />
```
Force use of one object. objectId is the object to use. If more than one object is specified, only the first one owned will be used.

### Special sections

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
