
/**
 * Item effect / usage description
 */
interface ItemEffect {

    /** Combat.COMBATSKILL for combat skill increment. Item.ENDURANCE for endurance points increment. */
    cls: string;

    /** Attribute increment */
    increment: number;
}

/**
 * Game object information
 */
class Item {

    // Item effect classes (see ItemEffect interface)
    public static readonly COMBATSKILL = "combatSkill";
    public static readonly ENDURANCE = "endurance";

    // Object types
    public static readonly SPECIAL = "special";
    public static readonly OBJECT = "object";
    public static readonly WEAPON = "weapon";

    // Object ids
    public static readonly MONEY = "money";
    public static readonly QUIVER = "quiver";
    public static readonly ARROW = "arrow";
    public static readonly MAP = "map";
    public static readonly BOW = "bow";
    public static readonly MEAL = "meal";
    public static readonly BACKPACK = "backpack";
    public static readonly HELSHEZAG = "helshezag";

    /** The object type ('special', 'object' or 'weapon' ) */
    public type: string;

    /** The object id */
    public id: string;

    /** The translated object name */
    public name: string;

    /** True if the object is a meal */
    public isMeal: boolean;

    /** True if the object is an Arrow */
    public isArrow: boolean;

    /** True if the object can be dropped */
    public droppable: boolean;

    /**
     * Number of items the object it occupies on the backpack.
     * It can be zero. It can be decimal (ex. 0.5)
     * It's used too for the Special Items max. limit
     */
    public itemCount: number;

    /**
     * Number of allowed usage of the item
     */
    public usageCount: number;

    /** The translated object description */
    public description: string;

    /**
     * Translated extra description.
     * It's optional (can be null)
     */
    public extraDescription: string = null;

    /**
     * The weapon type. Only for special and object types. It is the kind of weapon.
     * If it can be handled as more than one weapon type, separate the with a '|'.
     * Ex. 'sword|shortsword'
     */
    public weaponType: string;

    /** Get the object image URL, untranslated. null if the object has no image. */
    private imageUrl: string;

    /**
     * The book number that contains the image (1-index based).
     * Needed to check if the book has been downloaded on the Cordova app
     */
    private imageBookNumber: number;

    /**
     * Combat skill increment.
     * If it's a weapon, only when it's the current weapon. Otherwise, when the player carry the object
     */
    public combatSkillEffect: number = 0;

    /** Endurance increment when the player carry the object */
    public enduranceEffect: number = 0;

    /** Usage (only one use, and then the object is dropped) */
    public usage: ItemEffect;

    /** Object ids that cannot be carried at same time with this object.
     * Empty array if there are no incompatibilities
     */
    public incompatibleWith: string[] = [];

    /**
     * Game object information
     * @param book The owner book
     * @param $o The XML tag with the object info
     * @param objectId The object identifier
     */
    constructor(book: Book, $o: any, objectId: string) {

        /** The object type ('special', 'object' or 'weapon' ) */
        this.type = $o.prop("tagName");
        /** The object id */
        this.id = objectId;
        /** The translated object name */
        this.name = $o.find("name[lang=" + book.language + "]").text();

        // True if the object is a meal
        this.isMeal = $o.attr("isMeal") === "true";

        // True if the object is an Arrow
        this.isArrow = $o.attr("isArrow") === "true";

        /** True if the object can be dropped */
        this.droppable = $o.attr("droppable") !== "false";

        /** Number of items the object it occupies on the backpack */
        const txtItemCount: string = $o.attr("itemCount");
        this.itemCount = txtItemCount ? parseInt(txtItemCount, 10) : 1;

        /** Number of usage of the object */
        const txtUsageCount: string = $o.attr("usageCount");
        this.usageCount = txtUsageCount ? parseInt(txtUsageCount, 10) : 1;

        /** The translated object description */
        this.description = $o.find("description[lang=" + book.language + "]").text();

        // If it's the map, add description from the book:
        if (objectId === Item.MAP) {
            this.assignMapDescription(book);
        }

        if (this.itemCount !== 1) {
            // Add description of the size used
            if (this.description) {
                this.description += " ";
            }
            this.description += translations.text("countAsObjects", [this.itemCount]);
        }

        // Extra description
        this.extraDescription = $o.find("extraDescription[lang=" + book.language + "]").text();

        /**
         * The weapon type. Only for special and object types. It is the kind of weapon.
         * If it can be handled as more than one weapon type, separate the with a '|'.
         * Ex. 'sword|shortsword'
         */
        this.weaponType = $o.attr("weaponType");

        // Object image
        this.loadImageInfo($o);

        // Usage (only one use, and then the object is dropped)
        const $usage = $o.find("usage");
        if ($usage.length > 0) {
            this.usage = {
                cls: $usage.attr("class"),
                increment: parseInt($usage.attr("increment"), 10),
            };
        }

        // Effects (when the player carry the object)
        const $effects: any[] = $o.find("effect");
        for (const effect of $effects) {
            const $effect = $(effect);
            const increment = parseInt($effect.attr("increment"), 10);
            const cls: string = $effect.attr("class");
            if (cls === Item.COMBATSKILL) {
                this.combatSkillEffect = increment;
            } else if (cls === Item.ENDURANCE) {
                this.enduranceEffect = increment;
            } else {
                console.log("Object " + this.id + ", wrong class effect: " + cls);
            }
        }

        // Incompatibilities
        this.incompatibleWith = mechanicsEngine.getArrayProperty($o, "incompatibleWith");

    }

    private assignMapDescription(book: Book) {
        // Exception with book 11: The "map" section refers to "Northern Magnamund", no the real map at sect233
        if (book.bookNumber === 11) {
            return;
        }

        const mapSection = new Section(book, Book.MAP_SECTION, null);
        if (mapSection.exists()) {
            this.description = mapSection.getTitleText();
        }
    }

    /** Returns true if the object is a weapon */
    public isWeapon(): boolean {
        if (this.weaponType) {
            return true;
        }
        return this.type === "weapon";
    }

    /**
     * Returns true if the object is a weapon of a given type
     * @param  weaponType The weapon type to check
     * @return True if the object is a weapon of the given type
     */
    public isWeaponType(weaponType: string): boolean {
        if (this.id === weaponType) {
            return true;
        }
        if (this.weaponType) {
            return this.weaponType.split("|").contains(weaponType);
        }
        return false;
    }

    /** Returns true if this is a hand-to-hand weapon (not a bow) */
    public isHandToHandWeapon(): boolean {
        if (!this.isWeapon()) {
            return false;
        }
        if (this.id === "bow" || this.weaponType === "bow") {
            return false;
        }
        return true;
    }

    /**
     * Get the object image URL.
     * @return The object image URL. null if the object has no image or we are
     * running the Cordova app and the book for the image is not downloaded
     */
    public getImageUrl(): string {

        if (!this.imageUrl) {
            return null;
        }

        // Cordova app: Check if the book where is the image is downloaded
        if (!state.localBooksLibrary.isBookDownloaded(this.imageBookNumber)) {
            return null;
        }

        return this.imageUrl;
    }

    /**
     * Get information about the image
     * @param {jQuery} $o XML node for object
     */
    private loadImageInfo($o: any) {
        const $image = $o.find("image");
        if ($image.length === 0) {
            return;
        }

        // Get the book number:
        const candidateBookNumbers: number[] = [];
        const txtBook: string = $image.attr("book");
        for (const txtBookNumber of txtBook.split("|")) {
            candidateBookNumbers.push(parseInt(txtBookNumber, 10));
        }
        if (candidateBookNumbers.length === 0) {
            return;
        }
        candidateBookNumbers.sort();

        // Default to the first one
        this.imageBookNumber = candidateBookNumbers[0];

        if (candidateBookNumbers.length > 1) {
            // Choose the last played (or playing) book.
            for (let i = candidateBookNumbers.length - 1; i >= 0; i--) {
                if (state.book.bookNumber >= candidateBookNumbers[i] && state.localBooksLibrary.isBookDownloaded(candidateBookNumbers[i])) {
                    this.imageBookNumber = candidateBookNumbers[i];
                    break;
                }
            }
        }

        const imageBook = new Book(this.imageBookNumber, state.book.language);
        this.imageUrl = imageBook.getIllustrationURL($image.attr("name"));
    }
}
