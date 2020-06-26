
/**
 * Inventory state at one point
 */
class InventoryState {

    public weapons: ActionChartItem[] = [];

    public hasBackpack: boolean = false;

    public backpackItems: ActionChartItem[] = [];

    public specialItems: ActionChartItem[] = [];

    public beltPouch: number = 0;

    public arrows: number = 0;

    public meals: number = 0;

    /**
     * Create a inventory state with the current inventory state
     * @param objectTypes Kind of objects to get: 'all' = all, 'weaponlike' = weapons and weapon Special Objects,
     * 'allobjects' = weapons, special items and backpack items
     */
    public static fromActionChart(objectTypes: string, actionChart: ActionChart): InventoryState {

        const objects = new InventoryState();

        if (objectTypes === "all" || objectTypes === "allobjects") {
            objects.weapons = actionChart.weapons.deepClone();
            objects.backpackItems = actionChart.backpackItems.deepClone();
            objects.specialItems = actionChart.specialItems.deepClone();
            objects.arrows = actionChart.arrows;
            objects.meals = actionChart.meals;

            if (objectTypes === "all") {
                objects.hasBackpack = actionChart.hasBackpack;
                objects.beltPouch = actionChart.beltPouch;
            }
        } else if (objectTypes === "weaponlike") {
            for (const w of actionChart.getWeaponAChartItems(false)) {
                objects.addItem(w.clone());
            }
        } else {
            throw "Wrong objectTypes: " + objectTypes;
        }

        return objects;
    }

    private addItem(aChartItem: ActionChartItem) {

        const item = aChartItem.getItem();
        if (!item) {
            return;
        }

        if (item.type === Item.WEAPON) {
            this.weapons.push(aChartItem);
        } else if (item.type === Item.SPECIAL) {
            this.specialItems.push(aChartItem);
        } else if (item.type === Item.OBJECT) {
            this.backpackItems.push(aChartItem);
        }
    }

    public addItemsArray(items: ActionChartItem[]) {
        for (const item of items) {
            this.addItem(item.clone());
        }
    }

    /**
     * Append to this inventory state other state
     * @param s2 The state to append to this
     */
    public addInventoryToThis(s2: InventoryState) {

        this.weapons = this.weapons.concat(s2.weapons);
        this.hasBackpack = this.hasBackpack || s2.hasBackpack;
        this.backpackItems = this.backpackItems.concat(s2.backpackItems);
        this.specialItems = this.specialItems.concat(s2.specialItems);
        this.beltPouch = this.beltPouch + s2.beltPouch;
        this.arrows = this.arrows + s2.arrows;
        this.meals = this.meals + s2.meals;
    }

    /**
     * Get special items on this state that are weapon, remove them from the state, and return them
     * @returns Special items on state that they were weapons
     */
    public getAndRemoveSpecialItemsNonWeapon(): ActionChartItem[] {

        // Recover only non-weapon special items
        const toRecover: ActionChartItem[] = [];
        for (const aChartItem of this.specialItems) {
            const i = aChartItem.getItem();
            if (i && !i.isWeapon()) {
                toRecover.push(aChartItem);
            }
        }

        // Remove recovered items
        for (const aChartItem of toRecover) {
            this.specialItems.removeValue(aChartItem);
        }

        return toRecover;
    }

    /**
     * Create a inventory state from an object
     * @param object The inventory state object. Must to have same properties than InventoryState
     */
    public static fromObject(object: any): InventoryState {
        if (!object) {
            return new InventoryState();
        }

        const inventoryState: InventoryState = $.extend(new InventoryState(), object);
        // Convert objects to ActionChartItem:
        inventoryState.weapons = ActionChartItem.fromObjectsArray(inventoryState.weapons);
        inventoryState.backpackItems = ActionChartItem.fromObjectsArray(inventoryState.backpackItems);
        inventoryState.specialItems = ActionChartItem.fromObjectsArray(inventoryState.specialItems);

        return inventoryState;
    }

    /** Return a plain object with this instance info. */
    public toObject(): any {
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
