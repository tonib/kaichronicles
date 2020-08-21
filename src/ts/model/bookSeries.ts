import { KaiDiscipline, MgnDiscipline, GndDiscipline, mechanicsEngine , Disciplines } from "..";

/**
 * Book series identifier
 */
export enum BookSeriesId {
    // Order is important!
    Kai = 0,
    Magnakai = 1,
    GrandMaster = 2
}

// TODO: Add other common disciplines definitions to BookSeries and use them from here (healing, hunt, etc)

/**
 * Books series info
 */
export class BookSeries {

    /** Book series identifier */
    public readonly id: BookSeriesId;

    /** Series first book, 1 based index (1 = first book) */
    public readonly bookStart: number;

    /** Series last book, 1 based index (1 = first book) */
    public readonly bookEnd: number;

    /** Initial number of disciplines */
    public readonly initialNDisciplines: number;

    /** Discipline id for "Weaponskill" in this series */
    public readonly weaponskillDiscipline: string;

    /** Initial number of weapons for weaponskill discipline */
    public readonly initialWeaponskillNWeapons: number;

    /** Discipline id for "Mindshield" in this series */
    public readonly mindshieldDiscipline: string;

    /** Base CS when you pick your stats in this series */
    public readonly baseCombatSkill: number;

    /** Base EP when you pick your stats in this series */
    public readonly baseEndurance: number;

    /**
     * Supported book series. This array can be accesed with a BookSeriesId index
     */
    public static readonly series: BookSeries[] = [
        new BookSeries(BookSeriesId.Kai, 1, 5, 5, KaiDiscipline.Weaponskill, 1, KaiDiscipline.Mindshield, 10, 20),
        new BookSeries(BookSeriesId.Magnakai, 6, 12, 3, MgnDiscipline.Weaponmastery, 3, MgnDiscipline.PsiScreen, 10, 20),
        new BookSeries(BookSeriesId.GrandMaster, 13, 20, 4, GndDiscipline.GrandWeaponmastery, 2, GndDiscipline.KaiScreen, 25, 30)
    ];

    private constructor(id: BookSeriesId, bookStart: number, bookEnd: number, initialNDisciplines: number,
                        weaponskillDiscipline: string, initialWeaponskillNWeapons: number, mindshieldDiscipline: string,
                        baseCombatSkill: number, baseEndurance: number) {
        this.id = id;
        this.bookStart = bookStart;
        this.bookEnd = bookEnd;
        this.initialNDisciplines = initialNDisciplines;
        this.weaponskillDiscipline = weaponskillDiscipline;
        this.initialWeaponskillNWeapons = initialWeaponskillNWeapons;
        this.mindshieldDiscipline = mindshieldDiscipline;
        this.baseCombatSkill = baseCombatSkill;
        this.baseEndurance = baseEndurance;
    }

    /** Get disciplines ids in this book series */
    public getDisciplines(): string[] {
        return Disciplines.getSeriesDisciplines(this.id);
    }

    /**
     * Get the book series for a given book number
     * @param bookNumber The book number (1 based index, 1=first book)
     * @returns The book series for that book number. Kai books series will be returned if not found
     */
    public static getBookNumberSeries(bookNumber: number): BookSeries {
        for (const series of BookSeries.series) {
            if (bookNumber >= series.bookStart && bookNumber <= series.bookEnd) {
                return series;
            }
        }
        mechanicsEngine.debugWarning("BookSeries.getBookNumberSeries: wrong book number");
        return BookSeries.series[0];
    }

    /**
     * Returns true if a book starts a new books series
     * @param bookNumber The book number (1 based index, 1=first book)
     */
    public static isSeriesStart(bookNumber: number): boolean {
        for (const series of BookSeries.series) {
            if (series.bookStart === bookNumber) {
                return true;
            }
        }
        return false;
    }
}
