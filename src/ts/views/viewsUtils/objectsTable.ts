
/**
 * Kind of objects table
 */
enum ObjectsTableType {
    /** Availabe objects on section (free or for buy ) */
    AVAILABLE,
    /** Sell inventory objects */
    SELL,
    /** Inventory objects */
    INVENTORY
}

/**
 * An objects table renderer
 */
class ObjectsTable {

    /** The table type */
    private type: ObjectsTableType;

    /** The jQuery for the objects table tag */
    private $tableBody: any;

    /** The objects to render */
    private objects: ObjectsTableItem[] = [];

    /**
     * Fill table with object descriptions.
     * @param objects Array with objects ids (string) OR SectionItem's
     * @param $tableBody The HTML table to fill
     * @param type Table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     */
    constructor(objects: Array<string|SectionItem>, $tableBody: JQuery<HTMLElement>, type: ObjectsTableType ) {

        this.type = type;
        this.$tableBody = $tableBody;

        this.fillObjectsList( objects );
    }

    /**
     * Converts the provided array of either strings or SectionItems to
     * a proper array of ObjectsTableItems.
     */
    public fillObjectsList( objects: Array<string|SectionItem>) {
        let arrows = ( this.type === ObjectsTableType.INVENTORY ) ? state.actionChart.arrows : 0;

        for ( const obj of objects ) {
            let sectionItem: SectionItem = null;

            if ( typeof(obj) === "string" ) {
                // It's a Item id
                let count = 0;

                if ( obj === Item.QUIVER ) {
                    count = Math.min( 6, arrows );
                    arrows -= count;
                }

                const item = state.mechanics.getObject(obj);
                sectionItem = {
                    id : obj,
                    price : 0,
                    unlimited : false,
                    count,
                    useOnSection : false,
                    usageCount: item && item.usageCount ? item.usageCount : 1
                };
            } else {
                sectionItem = obj;
            }

            this.objects.push( new ObjectsTableItem( sectionItem, this.type ) );
        }
    }

    /**
     * Fills the table and binds events
     */
    public renderTable() {

        this.$tableBody.empty();

        // Populate the table
        let html = "";
        for ( const o of this.objects ) {

            const objectHtml = o.renderItem();
            if ( objectHtml ) {
                html += "<tr><td>" + objectHtml + "</td></tr>";
            }
        }

        if ( !html ) {
            html = "<tr><td><i>(" + translations.text("noneMasculine") + ")</i></td></tr>";
        }

        this.$tableBody.append( html );

        // Bind events:
        ObjectsTable.bindTableEquipmentEvents( this.$tableBody , this.type );
    }

    public static bindTableEquipmentEvents( $tableBody: any , type: ObjectsTableType) {

        $tableBody
        .find(".equipment-op")
        // Include the $element itself too
        .addBack(".equipment-op")
        .click(function(e: Event) {
            e.preventDefault();
            const $link = $(this);

            const op: string = $link.attr("data-op");
            if ( !op ) {
                return;
            }
            const i = ObjectsTableItem.restoreFromLink( $link , type );
            if ( !i ) {
                return;
            }

            i.runOperation( op );
        });
    }

}
