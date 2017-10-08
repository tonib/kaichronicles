
/**
 * Modal dialog to pick / drop money.
 * The use of this dialog to pick AND drop money on the same page is currently not supported (not needed right now)
 */
class MoneyDialog {

    public static show(drop : boolean) {

        MoneyDialog.setupDialog(drop);

        // Update bounds and initial value
        if( drop ) {
            $('#mechanics-moneyamount')
            .attr('max', state.actionChart.beltPouch )
            .val('1');
        }
        else {
            // TODO
        }

        $('#mechanics-moneydialog').modal('show');
    }

    private static setupDialog(drop : boolean) {

        // If the dialog HTML do not exists, add it:
        if( $('#mechanics-moneydialog').length > 0 )
            return;

        const $moneyDlg = mechanicsEngine.getMechanicsUI( 'mechanics-moneydialog' );
        $('body').append( $moneyDlg );


        // Bind money picker events
        $('#mechanics-moneyamount').bindNumberEvents();

        // Bind drop money confirmation button
        $('#mechanics-moneyapply').click( function(e : Event) {
            e.preventDefault();
            const $moneyAmount = $('#mechanics-moneyamount');
            if( $moneyAmount.isValid() ) {
                actionChartController.increaseMoney( - $moneyAmount.getNumber() , true );
                $('#mechanics-moneydialog').modal('hide');
            }
        });

    }
}
