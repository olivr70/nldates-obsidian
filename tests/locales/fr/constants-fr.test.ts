import { DAY_NAMES_FR_REGEX, findDayFromStartFr, parseJourSemaineX, parseMonthNameFr, parseRegRelativeDayFr, REG_RELATIVE_DAY_FR } from "../../../src/locales/fr/constants-fr"

import "../../date-equality"

describe('constants-fr', () => {
    describe('parsing day names', () => {
        test('DAY_NAMES_', () => {
            expect(DAY_NAMES_FR_REGEX.test("lundi")).toBeTruthy();
            expect(DAY_NAMES_FR_REGEX.test("mardi")).toBeTruthy();
            expect(DAY_NAMES_FR_REGEX.test("mercredi")).toBeTruthy();
            expect(DAY_NAMES_FR_REGEX.test("jeudi")).toBeTruthy();
            expect(DAY_NAMES_FR_REGEX.test("vendredi")).toBeTruthy();
            expect(DAY_NAMES_FR_REGEX.test("samedi")).toBeTruthy();
            expect(DAY_NAMES_FR_REGEX.test("dimanche")).toBeTruthy();
        })
        test('findDayFromStartFr() should match', () => {
            expect(findDayFromStartFr("ma")).toBe(2)
            expect(findDayFromStartFr("merc")).toBe(3)
            expect(findDayFromStartFr("JEU")).toBe(4)
            expect(findDayFromStartFr("samedi")).toBe(6)
            expect(findDayFromStartFr("DIMANCHE")).toBe(0)
        })
    })
    describe('parsing month names', () => {
        test('findDayFromStartFr() should match', () => {
            expect(parseMonthNameFr("Nov")).toBe(10)
            expect(parseMonthNameFr("février")).toBe(1)
            expect(parseMonthNameFr("FEVRIER")).toBe(1)
        })
        test("findDayFromStartFr() should return -1 if no match", () => {
            expect(parseMonthNameFr("xx")).toBe(-1)
            
        })
        test("findDayFromStartFr() should return -1 if prefix is ambiguous", () => {
            expect(parseMonthNameFr("Ma")).toBe(-1)
            expect(parseMonthNameFr("jui")).toBe(-1)
            
        })
        
    })
    describe('parseJourSemaineX', () => {
        test('should parse standard forms', () => {
            const refDate = new Date(2024,0,1)
            // see https://www.calendrier.best/numero-de-semaine-2024.html
            expect(parseJourSemaineX("mardi de la semaine 4", refDate)).toEqual(new Date(2024,0,23, 12))
            expect(parseJourSemaineX("dimanche de la semaine 4", refDate)).toEqual(new Date(2024,0,28, 12))
            expect(parseJourSemaineX("lundi de la semaine 52", refDate)).toEqual(new Date(2024,11,23, 12))
        })
        test('should parse forms with year', () => {
            const refDate = new Date(2020,0,1)
            // see https://www.calendrier.best/numero-de-semaine-2024.html
            expect(parseJourSemaineX("mardi de la semaine 4 de l'année 2024", refDate)).toEqual(new Date(2024,0,23, 12))
            expect(parseJourSemaineX("dimanche de la semaine 4 en 2024", refDate)).toEqual(new Date(2024,0,28, 12))
            expect(parseJourSemaineX("lundi de la semaine 52 de 2024", refDate)).toEqual(new Date(2024,11,23, 12))
        })
        test('should parse short forms', () => {
            const refDate = new Date(2024,0,1)
            // see https://www.calendrier.best/numero-de-semaine-2024.html
            expect(parseJourSemaineX("mardi semaine 4", refDate)).toEqual(new Date(2024,0,23,12))
            expect(parseJourSemaineX("mardi sem 4", refDate)).toEqual(new Date(2024,0,23,12))
            expect(parseJourSemaineX("mar sem 4", refDate)).toEqual(new Date(2024,0,23,12))
        })
        test('should parse next and previous forms', () => {
            const refDate = new Date(2024,0,1)
            // see https://www.calendrier.best/numero-de-semaine-2024.html
            expect(parseJourSemaineX("jeudi de la semaine prochaine", refDate)).toEqual(new Date(2024,0,11, 12))
            expect(parseJourSemaineX("mardi de la semaine précédente", refDate)).toEqual(new Date(2023,11,26,12))
            // 
            expect(parseJourSemaineX("mardi de la semaine prochaine", new Date(2024,8,18))).toEqual(new Date(2024,8,24,12))
        })
    })
})

describe("RegRelativeDayFr", () => {
    // Note : January, 8th of 2024 is a monday
    describe("regexp", () => {
        ["lundi en huit", "MARDI prochain", "Mercredi précédent","jeudi d'avant",
            "vendredi suivant", "vendredi d'après", "samedi d avant", "dimanche précédent"]
            .forEach(x => test(x, () => expect(REG_RELATIVE_DAY_FR.test(x)).toBeTruthy()))
    })
    test("prochain", () => {
        expect(parseRegRelativeDayFr("mardi prochain", new Date(2024,0,8))).toEqual(new Date(2024,0,9))
    })
    test("suivant", () => {
        expect(parseRegRelativeDayFr("mardi suivant", new Date(2024,0,8))).toEqual(new Date(2024,0,9))
    })
    test("d'après", () => {
        expect(parseRegRelativeDayFr("mardi d'après", new Date(2024,0,8))).toEqual(new Date(2024,0,9))
    })
    test("en huit", () => {
        expect(parseRegRelativeDayFr("mardi en huit", new Date(2024,0,8))).toEqual(new Date(2024,0,16))
    })
    test("précédent", () => {
        expect(parseRegRelativeDayFr("mardi précédent", new Date(2024,0,8))).toEqual(new Date(2024,0,2))
    })
    test("from a sunday", () => {
        expect(parseRegRelativeDayFr("mardi en huit", new Date(2024,0,7))).toEqual(new Date(2024,0,16))
    })
})