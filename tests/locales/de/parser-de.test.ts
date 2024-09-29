import dayjs from "dayjs";
import NLDParserDe from "../../../src/locales/de/parser-de";
import { parseMonthNameDe } from "../../../src/locales/de/constants-de";

import "../../date-equality"

describe("NLDParserDe", () => {
    let parser:NLDParserDe;
    beforeAll(() => {
        parser = new NLDParserDe("de");
      });
    describe("getFormattedDate() should", () => {
        test("format  dates", () => {
            expect(parser.getFormattedDate(new Date(2024,9,2), "YYYY-MM-DD")).toBe("2024-10-02");
        })
        test("format localised dates", () => {
            expect(parser.getFormattedDate(new Date(2024,9,2), "LL")).toBe("2. Oktober 2024")
        })
    })
    
    describe("shoud handle all standard Chrono patterns", () => {
        test("ISO dates", () => {
            expect(parser.getParsedDate("2024-12-25", "monday")).toEqual(new Date(2024,11,25,12));
        })
        test("Slash dates", () => {
            expect(parser.getParsedDate("25/12/2024", "monday")).toEqual(new Date(2024,11,25,12));
        })
        test("standard times", () => {
            expect(parser.getParsedDate("8:25:10", "monday")).toEqual(dayjs().hour(8).minute(25).second(10));
        })
        test("german times", () => {
            expect(parser.getParsedDate("8h25m10", "monday")).toEqual(dayjs().hour(8).minute(25).second(10));
        })
    })
    describe("parse() should parse", () => {
        test("date with ordinals", () => {
            const thisYear = new Date().getFullYear()
            const val = parser.getParsedDate("zwanzigste Mai", "monday")
            const val2 = parser.getParsedDate("zwanzigsten Mai", "monday")
            const exp = dayjs(new Date(2024,8,20))
            expect(parser.getParsedDate("zwanzigste September", "monday")).toEqual(new Date(thisYear,8,20,12));
            expect(parser.getParsedDate("zwanzigsten Mai", "monday")).toEqual(new Date(thisYear,4,20,12));
            expect(parser.getParsedDate("ersten Januar", "monday")).toEqual(new Date(thisYear,0,1,12));
            expect(parser.getParsedDate("ersten Januar", "monday")).toEqual(new Date(thisYear,0,1,12));
            expect(parser.getParsedDate("dreißigste April", "monday")).toEqual(new Date(thisYear,3,30,12));
            expect(parser.getParsedDate("erste Mai**", "monday")).toEqual(new Date(thisYear,4,1,12));   
            expect(parser.getParsedDate("dritte Juni", "monday")).toEqual(new Date(thisYear,5,3,12));    })
    })
})