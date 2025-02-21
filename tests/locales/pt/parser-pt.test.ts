import { testFullMatches } from "../../regexTestTools";
import { REG_PREFIX_RELATIVE_DAY_PT as RegPrefixRelativeDayPt, REG_SUFFIX_RELATIVE_DAY_PT as RegSuffixRelativeDayPt } from "../../../src/locales/pt/constants-pt";
import NLDParserPt, { ParserPrefixRelativeDayPt, ParserSuffixRelativeDayPt as ParserSuffixRelativeDayPt } from "../../../src/locales/pt/parser-pt";


import "../../date-equality"

const LOC = "pt"

describe('parser-pt', () => {
    let p:NLDParserPt;
    let monday6:Date = new Date(2025, 0, 6, 12 )  // monday, January 6th of 2025
    beforeEach( () => {
        p = new NLDParserPt()
    })
    test("should parse named days", () => {
        expect(p.getParsedDate("ano novo"))
            .toEqual(new Date(2025,0,1,12))
        expect(p.getParsedDate("ano novo 2023"))
            .toEqual(new Date(2023,0,1,12))
        expect(p.getParsedDate("ano novo de 2022"))
            .toEqual(new Date(2022,0,1,12))
    })
    describe("should parse relative days", () => {
        describe("RegPrefixRelativeDayPt", () => { 
            testFullMatches(RegPrefixRelativeDayPt, 
                "próxima terça-feira", "próxima quinta-feira")
        })
        describe("ParserPrefixRelativeDayPt", () => {
            testFullMatches(ParserPrefixRelativeDayPt.pattern(null), 
                "próxima terça-feira", "próxima quinta-feira", "próximo sabado"
            )
            testFullMatches(ParserPrefixRelativeDayPt.pattern(null), 
                "PRÓXIMA TERÇA-FEIRA", "Próxima Quinta-Feira", "Próximo SABADO"
            )
        })
        describe("RegSuffixRelativeDayPt", () => { 
            testFullMatches(RegSuffixRelativeDayPt, 
                "Segunda-feira antes","Segunda-feira anterior", 
                "Quarta-feira em oito",
                "Quarta-feira passada", "Quarta-feira última")
        })
        describe("ParserSuffixRelativeDayPt", () => {
            testFullMatches(ParserSuffixRelativeDayPt.pattern(null), 
                "Segunda-feira antes",
                "Segunda-feira anterior", 
                "Quarta-feira em oito", 
                "Sábado ultimo"
        )
        })
        test("getParsedDate() should parse relative days", () => {
            const dbg1 = p.getParsedDate("Sábado ultimo", monday6)
            expect(p.getParsedDate("Sábado ultimo", monday6)).toEqual(new Date(2025,0,4,12))
            expect(p.getParsedDate("este Sábado", monday6)).toEqual(new Date(2025,0,11,12))
            expect(p.getParsedDate("este domingo", monday6)).toEqual(new Date(2025,0,12,12))
            expect(p.getParsedDate("ultimo Sábado", monday6)).toEqual(new Date(2025,0,4,12))
            expect(p.getParsedDate("nesta Segunda-feira", monday6)).toEqual(new Date(2025,0,6,12))
            expect(p.getParsedDate("próxima quinta-feira", monday6)).toEqual(new Date(2025,0,9,12))
        })
    })
    test("jour de semaine", () => {
        expect(p.getParsedDate("terça-feira da semana 2 do ano 2024"))
            .toEqual(new Date(2024,0,9,12))
        expect(p.getParsedDate("terça-feira da semana 2"))
            .toEqual(new Date(2025,0,7,12))
    })
})