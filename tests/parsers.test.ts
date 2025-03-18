import { filterOverlappingResults, parseAllFromTextWithLocales } from "../src/parser"

describe("parsers module", () => {
    const refDate = new Date(2024, 1, 1) // tuesday, February 1st, 2024   
    describe('parseAllFromTextWithLocales()', () => {
        test('should work with a single locale', () => {
            const hierEn = parseAllFromTextWithLocales("( hier )", [ "en"], refDate)
            expect(hierEn).toEqual([])
            const hierFr = parseAllFromTextWithLocales("( hier )", [ "fr"], refDate)
            expect(hierFr.length).toEqual(1)
            const hierDemainFr = parseAllFromTextWithLocales("( hier et demain )", [ "fr"], refDate)
            expect(hierDemainFr.length).toEqual(2)

        })
        test('should work with multiple locales', () => {
            const hierYesterdayFr = parseAllFromTextWithLocales("( hier (yesterday) )", [ "fr", "en"], refDate)
            expect(hierYesterdayFr.length).toEqual(2)
            expect(hierYesterdayFr[0].locale).toEqual("fr")
            expect(hierYesterdayFr[1].locale).toEqual("en")
        })
        test('should work with complex dates', () => {
            const dateIso = parseAllFromTextWithLocales("( 2024-03-21 )", [ "en" ], refDate)
            expect(dateIso.length).toEqual(1)
            const dateFr = parseAllFromTextWithLocales("( 21/3/2024 )", [ "fr" ], refDate)
            expect(dateFr.length).toEqual(1)
        })
        test('should work with complex dates', () => {
            const dateNextTuesday = parseAllFromTextWithLocales("( mardi prochain )", [ "fr" ], refDate)
            expect(dateNextTuesday.length).toEqual(1)
            const dateTuesdayWeek43 = parseAllFromTextWithLocales("( mardi de la semaine 43 )", [ "fr" ], refDate)
            expect(dateTuesdayWeek43.length).toEqual(1)
            expect(dateTuesdayWeek43[0].start.date()).toEqual(new Date(2024,9,22, 12))
            const dateTuesdayWeek43OrThursdayWeek44 = parseAllFromTextWithLocales("( mardi de la semaine 43 ou le jeudi de la semaine 44 )", [ "fr" ], refDate)
            expect(dateTuesdayWeek43OrThursdayWeek44.length).toEqual(2)
            expect(dateTuesdayWeek43OrThursdayWeek44[0].start.date()).toEqual(new Date(2024,9,22, 12))
            expect(dateTuesdayWeek43OrThursdayWeek44[1].start.date()).toEqual(new Date(2024,9,31, 12))
        })
        test('should work with complex dates', () => {
        })
    })
    describe('filterOverlappingResults', () => {
        test('should filter on single position', () => {
            const hierYesterdayFr = parseAllFromTextWithLocales("( hier (yesterday) )", [ "fr", "en"], refDate)
            
            const hierYesterdayFrAt0 = filterOverlappingResults(hierYesterdayFr, 0)
            const hierYesterdayFrAt4 = filterOverlappingResults(hierYesterdayFr, 4)
            const hierYesterdayFrAt10 = filterOverlappingResults(hierYesterdayFr, 10)
            expect(hierYesterdayFrAt0.length).toEqual(0)
            expect(hierYesterdayFrAt4[0].text).toEqual("hier")
            expect(hierYesterdayFrAt10[0].text).toEqual("yesterday")
        })
    })
})