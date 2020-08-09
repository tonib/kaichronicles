import { BookSeriesId, KaiDiscipline, MgnDiscipline, GndDiscipline } from "..";

/**
 * Disciplines helpers
 */
export class Disciplines {

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
