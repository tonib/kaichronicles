# Objects

This a brief of the objects descriptions. They are stored at objects.xml file. 
General struture:

```xml
<object-mechanics>
    <weapons>
        <!-- Here goes weapons descriptions -->
        <weapon>...</weapon>
        <weapon>...</weapon>
    </weapons>

    <specials>
        <!-- Here goes special items descriptions -->
        <special>...</special>
        <special>...</special>
    </specials>

    <objects>
        <!-- Here goes objects descriptions -->
        <object>...</object>
        <object>...</object>
    </objects>

</object-mechanics>
```

## Common tags and properties

There are tags / properties common to weapons, special items and objects:

### "id" property
```xml
<weapon id="axe">...</weapon>
```
Mandatory. The object identifier

### "name" tag 
```xml
<weapon id="axe">
    <name lang="en">Axe</name>
    <name lang="es">Hacha</name>
    ...
</weapon>
```
The object name, translated to some language. **The english name translation is
  mandatory**.

### "description" tag
```xml
<special id="helmet">
    <description lang="en">This adds 2 ENDURANCE points to your total.</description>
    <description lang="es">Suma 2 puntos de RESISTENCIA a tu total</description>
    ...
</special>
```
Optional. A extended description for the object, translated to some language

### "extraDescription" tag
```xml
<special id="sommerswerd" weaponType="sword|broadsword|shortsword" >
    <name lang="en">Sommerswerd</name>
    <description lang="en">
        When used in combat, the Sommerswerd will add 8 points to your COMBAT SKILL 
        (+ Weaponskill with swords).
    </description>
    <extraDescription lang="en">
        It has the ability to absorb any magic that is used against its bearer, and it doubles 
        the total of all ENDURANCE points lost by undead enemies in combat
    </extraDescription>
    ...
</special>
```
Optional. A more extended description for the object, translated to some language

### "image" tag
```xml
<weapon id="broadsword">
    <image book="1|9" name="bsword.png" />
    ...
</weapon>
```
Optional. It references to some book image for the object. The image should be at 
/src/www/data/projectAon/[BOOKNUMBER]/ill_en/[IMAGENAME]. If object image was drawed by different
illustrators (Chalk / Williams), different books versions should be separated by a "|" character

### "droppable" property
```xml
<special id="baknaroil" droppable="false">
    <name lang="en">Baknar Oil on your skin</name>
    ...
</special>
```
Optional. If it's false, the player will cannot drop the object

### "effect" tag
```xml
<special id="helmet">
    <name lang="en">Helmet</name>
    <description lang="en">This adds 2 ENDURANCE points to your total.</description>
    <effect class="endurance" increment="2" />
    ...
</special>
```
Optional. If it's set, the object as some effect when it's carried:
* **"class" property**: It says what is the effect of the object:
    * "endurance": The endurance will be increased
    * "combatSkill": The combat skill will be increased
    * "special": Objects with complex behavior. They are implemented on SpecialObjectsUse class, at specialObjectsUse.ts
* **"increment" property**: Amount to increment

### "incompatibleWith" property
```xml
<special id="chainmail" incompatibleWith="chainmail|broninvest">
    ...
</special>
```
Optional. If it's set, the player cannot pick the object if it already has some of the
incompatible objects

## Weapons

There are standard weapons on 1-5 books: axe, dagger, sword, etc. Also, there are weapons
based on these standard weapons, but they must to be differentiated. In this case, set
the property "weaponType" to set the class of standard weapon (used for Weapon Skill
discipline). If it can be more than one, each class is separated with a "|" character:

```xml
<!-- This is a standard weapon -->
<weapon id="sword">
    <name lang="en">Sword</name>
    <name lang="es">Espada</name>
    <image book="1" name="sword.png" />
</weapon>

<!-- This is a non-standard weapon, based on a standard weapon-->
<weapon id="bonesword" weaponType="sword">
    <name lang="en">Bone Sword</name>
    <name lang="es">Espada de hueso</name>
    <image book="3" name="sword.png" />
</weapon>
```

### "weaponType" property
```xml
<special id="sommerswerd" weaponType="sword|broadsword|shortsword" >
    <name lang="en">Sommerswerd</name>
    ...
</special>
```
If it's set, the object can be used as a weapon. In the property value is set the 
class of weapon as it can be used. If it can be more than one, each class is separated
with a "|" character.

## Objects and Special Items

They can have some optional tags / properties:

### "usage" tag
```xml
<object id="healingpotion">
    <name lang="en">Healing Potion</name>
    <description lang="en">
        This can restore 4 ENDURANCE points to your total, when swallowed after combat. 
        You only have enough for one dose.
    </description>
    ...
    <usage class="endurance" increment="4" />
</object>
```

If it's set, the player can "use" the object, and then it will be dropped from the 
inventory. 

* **"class" property**: It says what is the effect of the object:
    * "endurance": The endurance will be increased
    * "combatSkill": The combat skill will be increased. This will apply only for the 
      current section
* **"increment" property**: Amount to increment

### "isMeal" property
If true, the object can be eaten as a Meal.

### "isArrow" property
If true, the object it's an Arrow, and it occupies an slot on a Quiver as a normal Arrow
