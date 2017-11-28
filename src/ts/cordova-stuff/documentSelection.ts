
/**
 * File selection and information about the selected file
 */
class DocumentSelection {

    /** URI for the selected file (content://blahblah...) */
    public uri : string;

    /** Selected file name */
    public fileName : string;

    /** Selected mime type */
    public mimeType : string;

    /**
     * Select a document from the UI, and get info about it
     * @returns Promise with the selected file
     */
    public static selectDocument() : Promise<DocumentSelection> {
        const dfd = jQuery.Deferred();

        DocumentSelection.selectDocumentWithUI()
        .then( function(uri : string) {
            return DocumentSelection.getDocumentInfo(uri);
        })
        .then( 
            function(doc : DocumentSelection ) { dfd.resolve(doc); },
            function( error ) { dfd.reject(error); }
        );
        return dfd.promise();
    }

    private static selectDocumentWithUI() : Promise<string> {
        const dfd = jQuery.Deferred();
        fileChooser.open(function(uri) {
            dfd.resolve(uri);
        });
        return dfd.promise();
    }

    private static getDocumentInfo(uri : string) : Promise<DocumentSelection>{
        const dfd = jQuery.Deferred();

        window.plugins.DocumentContract.getContract(
            {
                uri: uri,
                columns: [
                    '_display_name', 'mime_type'
                ]
            },
            function(contract) {
                const doc = new DocumentSelection();
                doc.fileName = contract['_display_name'];
                doc.mimeType = contract['mime_type'];
                doc.uri = uri;
                dfd.resolve(doc);
            },
            function(error) {
                dfd.reject( error );
            }
        );
        return dfd.promise();
    }

}