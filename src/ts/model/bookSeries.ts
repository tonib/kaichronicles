
/**
 * Book series identifier
 */
enum BookSeriesId {
    // Order is important!
    Kai = 0,
    Magnakai = 1,
    GrandMaster = 2
}
/**
 * Books series info
 */
class BookSeries {

    /** Book series identifier */
    public readonly id: BookSeriesId;
    /** Series first book, 1 based index (1 = first book) */
    public readonly bookStart: number;
    /** Series last book, 1 based index (1 = first book) */
    public readonly bookEnd: number;

    /**
     * Supported book series. This array can be accesed with a BookSeriesId index
     */
    public static readonly series: BookSeries[] = [
        new BookSeries(BookSeriesId.Kai, 1, 5), new BookSeries(BookSeriesId.Magnakai, 6, 12), new BookSeries(BookSeriesId.GrandMaster, 13, 99)
    ];

    private constructor(id: BookSeriesId, bookStart: number, bookEnd: number) {
        this.id = id;
        this.bookStart = bookStart;
        this.bookEnd = bookEnd;
    }

    public static getBookNumberSeries(bookNumber: number): BookSeries {
        for (const series of BookSeries.series) {
            if (bookNumber >= series.bookStart && bookNumber <= series.bookEnd) {
                return series;
            }
        }
        console.log("BookSeries.getBookNumberSeries: wrong book number");
        return BookSeries.series[0];
    }

}
