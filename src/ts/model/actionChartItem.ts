
/**
 * Information about an item stored in the action chart
 */
class ActionChartItem {

    /**
     * Item id
     */
    public id: string;

    /**
     * Number of allowed item uses
     */
    public usageCount: number;

    /**
     * Returns the Item info. null if it was not found
     */
    public getItem(): Item {
        return state.mechanics.getObject(this.id);
    }

    /**
     * Constructor
     * @param id Item identifier
     * @param usageCount Number of allowed item uses. If < 0 or not passed, the default numberuses will be assigned from the Item
     */
    constructor(id: string = null, usageCount: number = -1) {
        this.id = id;
        if (usageCount >= 0) {
            this.usageCount = usageCount;
        } else {
            const i: Item = this.getItem();
            this.usageCount = i ? i.usageCount : 0;
        }
    }

    /** Returns a copy of this item */
    public clone(): ActionChartItem {
        return new ActionChartItem(this.id, this.usageCount);
    }

    public static findById(array: ActionChartItem[], itemId: string): number {
        for ( let i = 0; i < array.length; i++) {
            if (array[i].id === itemId) {
                return i;
            }
        }
        return -1;
    }

    public static containsId(array: ActionChartItem[], itemId: string) {
        return ActionChartItem.findById(array, itemId) >= 0;
    }

    public static removeById(array: ActionChartItem[], itemId: string): boolean {
        const idx = ActionChartItem.findById(array, itemId);
        if (idx < 0) {
            return false;
        }
        array.splice(idx, 1);
        return true;
    }

    public static getIds(array: ActionChartItem[]): string[] {
        const ids: string[] = [];
        for (const i of array) {
            ids.push(i.id);
        }
        return ids;
    }

    public static fromObjectsArray(array: object[]): ActionChartItem[] {
        const result = [];
        for ( const o of array) {
            // On versions <= 1.11, the arrays elements in Action Chart (weapons, special and backpack items)
            // were a string with the item id. Starting from v. 1.12 they are an ActionChart, to store
            // the objects usage left. In v.1.11 and previous there was only one use
            if (typeof(o) === "string") {
                result.push( new ActionChartItem(o, 1) );
            } else {
                result.push( $.extend(new ActionChartItem(), o) );
            }
        }
        return result;
    }
}
