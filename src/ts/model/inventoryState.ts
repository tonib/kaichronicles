
/// <reference path="../external.ts" />

/**
 * Inventory state on a given moment
 */
class InventoryState {

    public weapons: Array<string> = [];

    public hasBackpack: boolean = false;

    public backpackItems: Array<string> = [];

    public specialItems: Array<string> = [];

    public beltPouch: number = 0;

    public arrows: number = 0;

    public meals: number = 0;

    /**
     * Create a inventory state with the current inventory state
     * @param objectTypes Kind of objects to get: 'all' = all, 'weaponlike' = weapons and weapon Special Objects,
     * 'allobjects' = weapons, special items and backpack items
     */
    public static fromActionChart( objectTypes : string , actionChart : ActionChart ) : InventoryState {

        let objects = new InventoryState();

        if( objectTypes == 'all' || objectTypes == 'allobjects' ) {
            objects.weapons = actionChart.weapons.clone();
            objects.backpackItems = actionChart.backpackItems.clone();
            objects.specialItems = actionChart.specialItems.clone();
            objects.arrows = actionChart.arrows;
            objects.meals = actionChart.meals;

            if( objectTypes == 'all' ) {
                objects.hasBackpack = actionChart.hasBackpack;
                objects.beltPouch = actionChart.beltPouch;
            }
        }
        else if( objectTypes == 'weaponlike' ) {
            for( let w of actionChart.getWeaponObjects(false) )
                objects.addItem( w );
        }
        else
            throw 'Wrong objectTypes: ' + objectTypes;
            
        return objects;
    }

    private addItem( item : Item ) {
        if( item.type == Item.WEAPON )
            this.weapons.push(item.id);
        else if( item.type == Item.SPECIAL)
            this.specialItems.push(item.id);
        else if( item.type == Item.OBJECT)
            this.backpackItems.push(item.id);
    }

    public addObjectIds( objectIds : Array<string> ) {
        for( let objectId of objectIds ) {
            const item = state.mechanics.getObject( objectId );
            if( !item )
                continue;
            this.addItem( item );
        }
    }

    /**
     * Append to this inventory state other state
     * @param s2 The state to append to this
     */
    public addInventoryToThis(s2 : InventoryState) {
        
        this.weapons = this.weapons.concat( s2.weapons );
        this.hasBackpack = this.hasBackpack || s2.hasBackpack;
        this.backpackItems = this.backpackItems.concat( s2.backpackItems );
        this.specialItems = this.specialItems.concat ( s2.specialItems );
        this.beltPouch = this.beltPouch + s2.beltPouch;
        this.arrows = this.arrows + s2.arrows;
        this.meals = this.meals + s2.meals;
    }

    /**
     * Get special items on this state that are weapon, remove them from the state, and return them
     * @returns Special items on state that they were weapons
     */
    public getAndRemoveSpecialItemsNonWeapon() : Array<string> {

        // Recover only non-weapon special items
        let toRecover : Array<string> = [];
        for(let itemId of this.specialItems) {
            const i = state.mechanics.getObject( itemId );
            if( i && !i.isWeapon() )
                toRecover.push( itemId );
        }

        // Remove recovered items
        for( let itemId of toRecover)
            this.specialItems.removeValue( itemId );

        return toRecover;
    }

    /**
     * Create a inventory state from an object
     * @param inventoryState The inventory state object. Must to have same properties than InventoryState
     */
    public static fromObject( inventoryState : any ) : InventoryState {
        if( !inventoryState )
            return new InventoryState();
        return $.extend(new InventoryState(), inventoryState);
    }
    
    /** Return a plain object with this instance info. */
    public toObject() : any {
        return {
            weapons: this.weapons,
            hasBackpack: this.hasBackpack,
            backpackItems: this.backpackItems,
            specialItems: this.specialItems,
            beltPouch: this.beltPouch,
            arrows: this.arrows,
            meals: this.meals
        };
    }
}
