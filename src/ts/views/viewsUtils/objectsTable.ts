
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
     * @param objects Array with ActionChartItem OR SectionItem to render
     * @param $tableBody The HTML table to fill
     * @param type Table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     */
    constructor(objects: Array<ActionChartItem|SectionItem>, $tableBody: JQuery<HTMLElement>, type: ObjectsTableType ) {

        this.type = type;
        this.$tableBody = $tableBody;

        this.fillObjectsList( objects );
    }

    /**
     * Converts the provided array of either strings or SectionItems to
     * a proper array of ObjectsTableItems.
     */
    public fillObjectsList( objects: Array<ActionChartItem|SectionItem>) {

        // Number of arrows to distribute across quivers. Only applies if this is a Action Chart table
        let arrows = ( this.type === ObjectsTableType.INVENTORY ) ? state.actionChart.arrows : 0;

        for ( const obj of objects ) {
            let sectionItem: SectionItem = null;

            if (obj instanceof ActionChartItem) {
                // It's an action chart item
                const aChartItem: ActionChartItem = obj;

                // Distribute arrows across owned quivers
                let count = 0;
                if ( aChartItem.id === Item.QUIVER ) {
                    count = Math.min( 6, arrows );
                    arrows -= count;
                }

                // Do the conversion from ActionChartItem to SectionItem
                sectionItem = {
                    id : aChartItem.id,
                    price : 0,
                    unlimited : false,
                    count,
                    useOnSection : false,
                    usageCount: aChartItem.usageCount ? aChartItem.usageCount : 1
                };
            } else {
                // Its a SectionItem
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
