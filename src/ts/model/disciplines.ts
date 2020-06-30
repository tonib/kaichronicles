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

    /** Get all Kai disciplines ids */
    public static getKaiDisciplinesIds(): string[] {
        return Disciplines.getDisciplinesIds(KaiDisciplines);
    }

    /** Get all Magnakai disciplines ids */
    public static getMagnakaiDisciplinesIds(): string[] {
        return Disciplines.getDisciplinesIds(MgnDisciplines);
    }

    /** Get all Grand Master disciplines ids */
    public static getGrandMasterDisciplinesIds(): string[] {
        return Disciplines.getDisciplinesIds(GndDisciplines);
    }

}
