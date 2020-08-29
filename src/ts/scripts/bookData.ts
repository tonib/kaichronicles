import * as child_process from "child_process";
import * as fs from "fs-extra";
import { BookMetadata, projectAon, Language } from "..";

/** Tool to download book data from the Project Aon SVN */
export class BookData {

    /**
     * URL base directory for extra contents for this application. 
     */
    private static readonly EXTRA_TONI_CONTENTS_URL = "https://projectaon.org/staff/toni/extraContent-DONOTREMOVE";

    /** URL for the PAON trunk (current version) */
    private static readonly SVN_TRUNK_URL = "https://www.projectaon.org/data/trunk";

    /**
     * The target directory root
     */
    public static readonly TARGET_ROOT = "www/data/projectAon";

    // BookData.LANGUAGES = ['en','es'];

    /** The book number 1-based index */
    private bookNumber: number;

    /** Metadata about the book */
    private bookMetadata: BookMetadata;

    /** The english book code */
    private enCode: string;

    /** The spanish book code */
    private esCode: string;

    /** Array with illustrations authors directories names */
    private illAuthors: string[];

    /**
     * Constructor
     * @param bookNumber The book number (1-based index)
     */
    constructor(bookNumber: number) {
        this.bookNumber = bookNumber;
        this.bookMetadata = projectAon.supportedBooks[ bookNumber - 1 ];
        this.enCode = this.bookMetadata.code_en;
        this.esCode = this.bookMetadata.code_es;
        this.illAuthors = this.bookMetadata.illustrators;
    }

    /**
     * Returns the SVN root for this book.
     * See projectAon.ts for an explanation
     */
    private getSvnRoot(): string {
        if ( this.bookMetadata.revision === 0 ) {
            return "https://www.projectaon.org/data/tags/20151013";
        } else {
            return "https://www.projectaon.org/data/trunk";
        }
    }

    /**
     * Get the book code for a given language
     */
    private getBookCode(language: Language): string {
        return language === Language.ENGLISH ? this.enCode : this.esCode;
    }

    /**
     * Get the local relative path for the book data
     */
    private getBookDir(): string {
        return BookData.TARGET_ROOT + "/" + this.bookNumber;
    }

    /**
     * Get the the book XML file book name
     * @param language The language code (en/es)
     * @returns The book XML file name
     */
    private getBookXmlName(language: Language) {
        return this.getBookCode( language )  + ".xml";
    }

    /**
     * Get the SVN source path for the book XML, as it is configured on projectAon.ts
     * @param language The language code (en/es)
     * @param root Optional. The SVN root to use. If null, the current published version will be used
     * @returns The currently used book XML URL at the PAON web site
     */
    private getXmlSvnSourcePath(language: Language, root: string = null): string {
        if ( !root ) {
            root = this.getSvnRoot();
        }
        return root + "/" + language + "/xml/" + this.getBookXmlName( language );
    }

    /**
     * Download the book XML for a given language
     * @param language The language code (en/es)
     */
    private downloadXml(language: Language) {

        // Download the book XML
        const sourcePath = this.getXmlSvnSourcePath(language);
        const targetPath = this.getBookDir() + "/" + this.getBookXmlName( language );
        const svnParams = [ "export" , sourcePath , targetPath ];
        this.runSvnCommand( svnParams );

        // Check if there are book patches
        // Patches are at [ROOT]/src/patches/projectAonPatches/, and they are downloaded by BookData.prototype.downloadPatches
        const patchFileName = this.getBookCode( language ) + "-" + this.bookMetadata.revision + ".diff";
        const patchPath = "src/patches/projectAonPatches/" + patchFileName;
        if ( fs.existsSync( patchPath ) ) {
            console.log( "Applying patch " + patchFileName + " to " + targetPath );
            // patch [options] [originalfile [patchfile]]
            child_process.execFileSync( "patch" , [ targetPath , patchPath ] , {stdio: [ 0, 1, 2 ]} );
        }
    }

    /**
     * Download an author biography file
     */
    private downloadAuthorBio(language: Language, bioFileName: string) {
        const sourcePath = this.getSvnRoot() + "/" + language + "/xml/" + bioFileName + ".inc";
        const targetPath = this.getBookDir() + "/" + bioFileName + "-" + language + ".inc";
        const svnParams = [ "export" , sourcePath , targetPath ];
        this.runSvnCommand( svnParams );
    }

    /**
     * Get the svn absolute URL for illustrations directory of a given author / language
     */
    private getSvnIllustrationsDir( language: Language, author: string): string {
        const booksSet = language === Language.ENGLISH ? "lw" : "ls";
        return this.getSvnRoot() + "/" + language + "/png/" +
            booksSet + "/" + this.getBookCode(language) + "/ill/" +
            author;
    }

    /**
     * Download illustrations
     */
    private downloadIllustrations(language: Language, author: string) {

        const sourceSvnDir = this.getSvnIllustrationsDir(language, author);
        const targetDir = this.getBookDir() + "/ill_" + language;
        fs.mkdirSync( targetDir );
        const svnParams = [ "--force", "export" , sourceSvnDir , targetDir ];
        this.runSvnCommand( svnParams );

        if ( this.bookNumber === 9 && language === Language.ENGLISH ) {
            this.book9ObjectIllustrations();
        }
    }

    /**
     * Download extra book 9 object illustrations.
     * On book 9, there is a illustrator change (Brian Williams). He did illustrations for objects that
     * exists on previous books. So, include on this book all existing objects illustrations
     */
    private book9ObjectIllustrations() {

        // Already included on book 9: dagger.png, sword.png, mace.png, bow.png, food.png, potion.png, quiver.png, rope.png

        const targetDir = this.getBookDir() + "/ill_en";

        // Not included on book 9, but in later books:
        const williamsIllustrations = {
            "axe.png" : "12tmod/ill/williams/axe.png",
            "spear.png" : "13tplor/ill/williams/spear.png",
            "bsword.png" : "17tdoi/ill/williams/bsword.png",
            "qstaff.png" : "12tmod/ill/williams/qurtstff.png"  // NAME CHANGED!!!
        };
        for (const illName of Object.keys(williamsIllustrations) ) {
            const svnSourcePath = this.getSvnRoot() + "/en/png/lw/" + williamsIllustrations[illName];
            const targetPath = targetDir + "/" + illName;
            this.runSvnCommand( [ "export" , svnSourcePath , targetPath ] );
        }

        // NOT included at any book: ssword.png,  warhammr.png. Added to https://projectaon.org/staff/toni/extraContent-DONOTREMOVE
        const williamsIllustrationsExtra = [
            BookData.EXTRA_TONI_CONTENTS_URL + "/ssword.png",
            BookData.EXTRA_TONI_CONTENTS_URL + "/warhammr.png"
        ];
        for (const ill of williamsIllustrationsExtra) {
            BookData.downloadWithWGet( ill , targetDir );
        }
    }

    /**
     * Download a file with wget
     * @param {string} url File URL to download
     * @param {string} targetDirectory Destination directory
     */
    private static downloadWithWGet( url: string , targetDirectory: string ) {
        // wget https://projectaon.org/staff/toni/extraContent-DONOTREMOVE/ssword.png -P targetDirectory/

        const params = [ url , "-P" , targetDirectory ];
        console.log( "wget " + params.join( " " ) );
        child_process.execFileSync( "wget" , params , {stdio: [0, 1, 2]} );
    }

    /**
     * Download the book cover
     */
    private downloadCover() {

        const coverPath = this.getSvnRoot() + "/en/jpeg/lw/" + this.getBookCode(Language.ENGLISH) +
            "/skins/ebook/cover.jpg";
        const targetPath = this.getBookDir() + "/cover.jpg";
        this.runSvnCommand( [ "export" , coverPath , targetPath ] );
    }

    private zipBook() {
        // Zip the book
        // Go to books dir
        const curDir = process.cwd();
        process.chdir(BookData.TARGET_ROOT);
        const txtBookNumber = this.bookNumber.toString();
        child_process.execFileSync( "zip" , ["-r" , txtBookNumber + ".zip" , txtBookNumber] , {stdio: [0, 1, 2]} );
        // Go back
        process.chdir(curDir);
    }

    public downloadBookData() {

        const bookDir = BookData.TARGET_ROOT + "/" + this.bookNumber;
        console.log("Re-creating directory " + bookDir);
        fs.removeSync( bookDir );
        fs.mkdirSync( bookDir );

        this.downloadCover();

        for (const langKey of Object.keys(Language)) {
            const language = Language[langKey];
            if (!this.getBookCode( language )) {
                // Skip books without given language
                continue;
            }

            // Download authors biographies
            this.bookMetadata.biographies.forEach( (authorBio) => {
                this.downloadAuthorBio(language, authorBio);
            });

            this.downloadXml(language);

            this.illAuthors.forEach( (author) => {
                this.downloadIllustrations(language , author);
            });

            this.downloadCombatTablesImages(language);
        }

        this.zipBook();
    }

    private downloadCombatTablesImages(language: Language) {
        const sourceSvnDir = this.getSvnIllustrationsDir(language, "blake");
        const targetDir = this.getBookDir() + "/ill_" + language;
        this.runSvnCommand( [ "export" , sourceSvnDir + "/crtneg.png" ,
            targetDir + "/crtneg.png" ] );
        this.runSvnCommand( [ "export" , sourceSvnDir + "/crtpos.png" ,
            targetDir + "/crtpos.png" ] );
    }

    private runSvnCommand( params: string[] ) {

        if ( this.bookMetadata.revision ) {
            // Add the revision number
            params = [ "-r" , this.bookMetadata.revision.toString() ].concat( params );
        }

        console.log( "svn " + params.join( " " ) );
        child_process.execFileSync( "svn" , params , {stdio: [0, 1, 2]} );
    }

    /**
     * Download book XML patches from PAON web site
     */
    private downloadBooksXmlPatches() {

        const patchesDirectory = "src/patches/projectAonPatches";
        if ( !fs.existsSync( patchesDirectory ) ) {
            console.log( "Creating PAON book xml patches directory: " + patchesDirectory );
            fs.mkdirSync( patchesDirectory );
        }

        const patchFileNames = [ "09ecdm-2655.diff" ];
        for (const patchName of patchFileNames) {
            if ( !fs.existsSync( patchesDirectory + "/" + patchName ) ) {
                BookData.downloadWithWGet( BookData.EXTRA_TONI_CONTENTS_URL + "/" + patchName , patchesDirectory );
            }
        }
    }

    /**
     * Check changes from the published app version with the trunk current version
     * @param {String} language Language to compare
     */
    public reviewChangesCurrentVersion(language: Language) {
        // svn diff -x --ignore-all-space https://www.projectaon.org/data/tags/20151013/es/xml/01hdlo.xml https://www.projectaon.org/data/trunk/es/xml/01hdlo.xml | iconv -f ISO-8859-1 | dwdiff --diff-input -c | less -R

        // The currently publised version with the app
        let publishedWithAppSvnPath = this.getXmlSvnSourcePath(language);
        if ( this.bookMetadata.revision ) {
            publishedWithAppSvnPath += "@" + this.bookMetadata.revision;
        }

        // The latest version on the PAON site
        const currentVersionPath = this.getXmlSvnSourcePath(language, BookData.SVN_TRUNK_URL);

        const shellCommand = "svn diff -x --ignore-all-space " +
            publishedWithAppSvnPath + " " +  currentVersionPath +
            " | iconv -f ISO-8859-1 | dwdiff --diff-input -c | less -R";
        console.log( shellCommand );
        child_process.spawn( "sh", ["-c", shellCommand], { stdio: "inherit" });
    }
}
