import NLDParserFr from "../../../src/locales/fr/parser-fr";


import "../../date-equality"

describe('parser-fr', () => {
    let p:NLDParserFr;
    beforeEach( () => {
        p = new NLDParserFr()
    })
    test("jours nommés", () => {
        expect(p.getParsedDate("nouvel an", "monday"))
            .toEqual(new Date(2024,0,1,12))
        expect(p.getParsedDate("nouvel an 2023", "monday"))
            .toEqual(new Date(2023,0,1,12))
        expect(p.getParsedDate("Nouvel-An 2022", "monday"))
            .toEqual(new Date(2022,0,1,12))
    })
    test("jour relatif", () => {
        expect(p.getParsedDate("mardi de la semaine 2 de l'année 2024", "monday")).toEqual(new Date(2024,0,9,12))
    })
    test("jour de semaine", () => {
        expect(p.getParsedDate("mardi de la semaine 2 de l'année 2024", "monday"))
            .toEqual(new Date(2024,0,9,12))
    })
})