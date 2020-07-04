/** Kai series disciplines codes */
enum KaiDiscipline {
    Camouflage = "camflage",
    Hunting = "hunting",
    SixthSense = "sixthsns",
    Tracking = "tracking",
    Healing = "healing",
    Weaponskill = "wepnskll",
    Mindshield = "mindshld",
    Mindblast = "mindshld",
    AnimalKinship = "anmlknsp",
    MindOverMatter = "mindomtr"
}

/** Magnakai series disciplines codes */
enum MgnDiscipline {
    Weaponmastery = "wpnmstry", // Duplicate!
    AnimalControl = "anmlctrl",
    Curing = "curing",
    Invisibility = "invsblty",
    Huntmastery = "hntmstry", // Duplicate!
    Pathsmanship = "pthmnshp", // Duplicate!
    PsiSurge = "psisurge",
    PsiScreen = "psiscrn",
    Nexus = "nexus", // Duplicate!
    Divination = "dvnation"
}

/** Grandmaster series disciplines codes */
enum GndDiscipline {
    GrandWeaponmastery = "wpnmstry", // Duplicate!
    AnimalMastery = "anmlmstr",
    Deliverance = "deliver",
    Assimilance = "assimila",
    GrandHuntmastery = "hntmstry", // Duplicate!
    GrandPathsmanship = "pthmnshp", // Duplicate!
    KaiSurge = "kaisurge",
    KaiScreen = "kaiscrn",
    GrandNexus = "nexus", // Duplicate!
    Telegnosis = "gnosis",
    MagiMagic = "magi",
    KaiAlchemy = "alchemy"
}

/**
 * Disciplines helpers
 */
class Disciplines {

    private static getDisciplinesIds(disciplinesEnum: any): string[] {
        const result = [];
        for (const disciplineKey of Object.keys(disciplinesEnum)) {
            result.push(disciplinesEnum[disciplineKey]);
        }
        return result;
    }

    /** Returns all disciplines ids for the  given book series */
    public static getSeriesDisciplines(seriesId: BookSeriesId): string[] {
        switch (seriesId) {
            case BookSeriesId.Kai:
                return Disciplines.getDisciplinesIds(KaiDiscipline);
            case BookSeriesId.Magnakai:
                return Disciplines.getDisciplinesIds(MgnDiscipline);
            case BookSeriesId.GrandMaster:
                return Disciplines.getDisciplinesIds(GndDiscipline);
            default:
                return [];
        }
    }
}
