
/// <reference path="../external.ts" />

/**
 * Inventory state on a given moment
 */
interface InventoryState {
    weapons: Array<string>;
    hasBackpack: boolean;
    backpackItems: Array<string>;
    specialItems: Array<string>;
    beltPouch: number;
    arrows: number;
    meals: number;
}
