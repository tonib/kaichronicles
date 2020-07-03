/** Kai series disciplines codes */
enum KaiDisciplines {
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
enum MgnDisciplines {
    Weaponmastery = "wpnmstry",
    AnimalControl = "anmlctrl",
    Curing = "curing",
    Invisibility = "invsblty",
    Huntmastery = "hntmstry",
    Pathsmanship = "pthmnshp",
    PsiSurge = "psisurge",
    PsiScreen = "psiscrn",
    Nexus = "nexus",
    Divination = "dvnation"
}

/** Grandmaster series disciplines codes */
enum GndDisciplines {
    GrandWeaponmastery = "wpnmstry",
    AnimalMastery = "anmlmstr",
    Deliverance = "deliver",
    Assimilance = "assimila",
    GrandHuntmastery = "hntmstry",
    GrandPathsmanship = "pthmnshp",
    KaiSurge = "kaisurge",
    KaiScreen = "kaiscrn",
    GrandNexus = "nexus",
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

    public static getSeriesDisciplines(seriesId: BookSeriesId): string[] {
        switch (seriesId) {
            case BookSeriesId.Kai:
                return Disciplines.getDisciplinesIds(KaiDisciplines);
            case BookSeriesId.Magnakai:
                return Disciplines.getDisciplinesIds(MgnDisciplines);
            case BookSeriesId.GrandMaster:
                return Disciplines.getDisciplinesIds(GndDisciplines);
            default:
                return [];
        }
    }
}
