import dayjs from "dayjs"
import { DAY_NAMES_INTL_PT_DICT, DAY_NAMES_PT_REGEX, findDayFromStartPt, NUMBER_PT_REGEX, ORDINAL_NUMBER_PT_REGEX, parseJourSemaineXPt, parseNumberPatternPt, parseRegPrefixRelativeDayPt, parseRegSuffixRelativeDayPt, SUFFIX_RELATIVES_FOR_DAYS_REGEX } from "../../../src/locales/pt/constants-pt"
import { testFullMatches, testMap, testNoMatches, testPartialMatches } from "../../regexTestTools"
import { matchPartialItem } from "../../../src/utils/regex"

describe("NUMBER_PATTERN_PT", () => {
    describe("should match", () => {
        testFullMatches(NUMBER_PT_REGEX, "12", "um", "dezesseis","vinte e sete", "trinta e um")
        testFullMatches(NUMBER_PT_REGEX, "12", "UM", "DEZESSEIS","VINTE E SETE", "TRINTA E UM")
        testNoMatches(NUMBER_PT_REGEX, "A12", "umi", "xxdezesseis")
        // it matches only full words
        testPartialMatches(NUMBER_PT_REGEX, ["vinte e seteR", "vinte"], ["trinta e umR","trinta"])  // 
        testPartialMatches(NUMBER_PT_REGEX, "(vinte)", "[vinte]","-dois,")  // 
    })
    describe("parseNumberPatternPt", () => {
        testMap(parseNumberPatternPt,
            ["12", 12],
            ["dezesseis", 16],
            ["VINTE E SETE", 27],
        )
    })
})
describe("ORDINAL_NUMBER_PATTERN_PT", () => {
    describe("should match", () => {
        const r = ORDINAL_NUMBER_PT_REGEX
        testFullMatches(ORDINAL_NUMBER_PT_REGEX, "primeiro", "décimo", "vigésimo segundo")
        testFullMatches(ORDINAL_NUMBER_PT_REGEX, "primeira", "décima", "vigésima segunda")
        testFullMatches(ORDINAL_NUMBER_PT_REGEX, "1°", "10°", "22°")
        testFullMatches(ORDINAL_NUMBER_PT_REGEX, "1ª", "10ª", "22ª")

    })
})
describe("SUFFIX_RELATIVES_FOR_DAYS_DICTIONARY_PT", () => {
    testFullMatches(SUFFIX_RELATIVES_FOR_DAYS_REGEX, 
        "anterior", "antes", "passada", "última", "em oito")

})
describe("DAY_NAMES_PT_REGEX", () => {
    const shorts = DAY_NAMES_INTL_PT_DICT;
    describe("should match full day names", () => {
        const rr = matchPartialItem("pt", DAY_NAMES_INTL_PT_DICT, {flags:"i"})
        testFullMatches(DAY_NAMES_PT_REGEX, 
            "Segunda-feira", "Terça-feira", "Quarta-feira","Quinta-feira","Sexta-feira", "Sábado", "Domingo")
        testFullMatches(DAY_NAMES_PT_REGEX, 
            "segunda-feira", "terça-feira", "quarta-feira","quinta-feira","sexta-feira", "sabado", "domingo")
    })
    describe("should match partial day names", () => {
        testFullMatches(DAY_NAMES_PT_REGEX, 
            "segunda-feir", "terça-feir", "quarta-feir","quinta-feir","sexta-feir", "sabad", "doming")
        testFullMatches(DAY_NAMES_PT_REGEX, 
            "seg.", "ter.", "qua.","qui.","sex.", "sab.", "dom.")
        testFullMatches(DAY_NAMES_PT_REGEX, 
            "segu", "terç", "quar","quin","sext", "saba", "domi")
    })
    describe("findDayFromStartPt", () => {
        testMap(findDayFromStartPt, 
            [ "sábado", 6], 
            [ "sabado", 6], 
            [ "segunda-feira", 1], 
            [ "terça-feira", 2], 
            [ "terca-feira", 2])
        
        testMap(findDayFromStartPt, 
            [ "SÁBADO", 6], 
            [ "SABADO", 6], 
            [ "SEGUNDA-FEIRA", 1], 
            [ "TERÇA-FEIRA", 2], 
            [ "TERCA-FEIRA", 2])
            
        testMap(findDayFromStartPt, 
            [ "sába", 6], 
            [ "sab", 6], 
            [ "sab.", 6], 
            [ "segun", 1], 
            [ "terça", 2], 
            [ "Terca", 2], 
            [ "TER", 2])
            
        testMap(findDayFromStartPt, 
            [ "sábi", -1], 
            [ "asaba", -1]
        )
    })
})

describe("Parsing relative days", () => {
    const monday6 = dayjs(new Date(2025,0,6)).locale("pt")  // monday 6th of January
    const friday10 = dayjs(new Date(2025,0,10)).locale("pt")  // friday 10th of January
    test("parseRegSuffixRelativeDayPt", () => {
        expect(parseRegSuffixRelativeDayPt("Segunda-feira última", monday6)).toEqual(new Date(2024,11,30,12))
        expect(parseRegSuffixRelativeDayPt("Terça-feira antes", monday6)).toEqual(new Date(2024,11,31,12))
        expect(parseRegSuffixRelativeDayPt("Quarta-feira anterior", monday6)).toEqual(new Date(2025,0,1,12))
        expect(parseRegSuffixRelativeDayPt("Quinta-feira passada", monday6)).toEqual(new Date(2025,0,2,12))
        expect(parseRegSuffixRelativeDayPt("Sexta-feira passada", monday6)).toEqual(new Date(2025,0,3,12))
        expect(parseRegSuffixRelativeDayPt("Sábado passado", monday6)).toEqual(new Date(2025,0,4,12))
        expect(parseRegSuffixRelativeDayPt("Domingo último", monday6)).toEqual(new Date(2025,0,5,12))
    })
    describe("parseRegPrefixRelativeDayPt", () => {
        test("should match current week (este, nesta)", () => {
            expect(parseRegPrefixRelativeDayPt("proxima Segunda-feira", monday6)).toEqual(new Date(2025,0,13,12))
            expect(parseRegPrefixRelativeDayPt("próxima quinta-feira", monday6)).toEqual(new Date(2025,0,9,12))
            expect(parseRegPrefixRelativeDayPt("nesta Segunda-feira", monday6)).toEqual(new Date(2025,0,6,12))
            expect(parseRegPrefixRelativeDayPt("nesta Terça-feira", monday6)).toEqual(new Date(2025,0,7,12))
            expect(parseRegPrefixRelativeDayPt("nesta Terça-feira", friday10)).toEqual(new Date(2025,0,7,12))
            expect(parseRegPrefixRelativeDayPt("nesta Quarta-feira", monday6)).toEqual(new Date(2025,0,8,12))
            expect(parseRegPrefixRelativeDayPt("nesta Quinta-feira", monday6)).toEqual(new Date(2025,0,9,12))
            expect(parseRegPrefixRelativeDayPt("nesta Sexta-feira", monday6)).toEqual(new Date(2025,0,10,12))
            expect(parseRegPrefixRelativeDayPt("este Sábado", monday6)).toEqual(new Date(2025,0,11,12))
            expect(parseRegPrefixRelativeDayPt("este Domingo", monday6)).toEqual(new Date(2025,0,12,12))
            expect(parseRegPrefixRelativeDayPt("ultimo Sábado", monday6)).toEqual(new Date(2025,0,4,12))
        })
        test("should match partial", () => {
            expect(parseRegPrefixRelativeDayPt("nesta Segu", monday6)).toEqual(new Date(2025,0,6,12))
            expect(parseRegPrefixRelativeDayPt("nesta Ter.", monday6)).toEqual(new Date(2025,0,7,12))
            expect(parseRegPrefixRelativeDayPt("nesta Quarta-fe", monday6)).toEqual(new Date(2025,0,8,12))
            expect(parseRegPrefixRelativeDayPt("nesta Qui.", monday6)).toEqual(new Date(2025,0,9,12))
            expect(parseRegPrefixRelativeDayPt("nesta Sex.", monday6)).toEqual(new Date(2025,0,10,12))
            expect(parseRegPrefixRelativeDayPt("este Sab.", monday6)).toEqual(new Date(2025,0,11,12))
            expect(parseRegPrefixRelativeDayPt("este Saba", monday6)).toEqual(new Date(2025,0,11,12))
            expect(parseRegPrefixRelativeDayPt("este Sabad", monday6)).toEqual(new Date(2025,0,11,12))
            expect(parseRegPrefixRelativeDayPt("este Dom.", monday6)).toEqual(new Date(2025,0,12,12))
        })
    })
})

describe("parseJourSemaineXPt", () => {
    const monday6_2025 = dayjs(new Date(2025,0,6)).locale("pt")  // monday 6th of January
    describe("should match without year", () => {
        test("", () => {
            expect(parseJourSemaineXPt("Quarta-feira da semana 2", monday6_2025))
                .toEqual(new Date(2025,0,8,12))

            })
        })
    describe("should match with year", () => {
        test("", () => {
            expect(parseJourSemaineXPt("Quarta-feira da semana 2 do ano 2024", monday6_2025))
                .toEqual(new Date(2024,0,10,12))

        })
    })
})