import dayjs from "dayjs";
import NLDParserEn from "../../../src/locales/en/parser-en";
import { parseMonthNameEn } from "../../../src/locales/en/constants-en"
import { timezoneOffset } from "../../../src/utils/intl";





describe("parseMonthNameEn() should", () => {
    test("match long names", () => {
        expect(parseMonthNameEn("March")).toBe(2);
    })
    test("match ignoring case", () => {
        expect(parseMonthNameEn("march")).toBe(2);
        expect(parseMonthNameEn("MARCH")).toBe(2);
        expect(parseMonthNameEn("maRch")).toBe(2);
    })
    test("match short names", () => {
        expect(parseMonthNameEn("mar")).toBe(2);
    })

})

describe("NLDParserEn", () => {
    let parser:NLDParserEn;
    beforeAll(() => {
        parser = new NLDParserEn("en");
      });
    describe("getFormattedDate() should", () => {
        test("format  dates", () => {
            expect(parser.getFormattedDate(new Date(2024,9,2), "YYYY-MM-DD")).toBe("2024-10-02");
        })
        test("format support localized formats", () => {
            const parserEn = new NLDParserEn("en")
            expect(parserEn.getFormattedDate(new Date(2024,9,2), "LL")).toBe("October 2, 2024")
            const parserUS = new NLDParserEn("en-US")
            expect(parserUS.getFormattedDate(new Date(2024,9,2), "LL")).toBe("October 2, 2024")
            const parserGB = new NLDParserEn("en-GB")
            expect(parserGB.getFormattedDate(new Date(2024,9,2), "LL")).toBe("2 October 2024")
        })
    })
    describe("ISO dates", () => {
        test("date with Z suffix", () => {
            const val = parser.getParsedDate("2024-01-01Z")
            const exp = new Date("2024-01-01T12:00Z")   
            expect(val).toEqual(exp)   
        })
        test("should parse ISO date without Z suffix as local time", () => {
            // compute the date for local (the test has to work in any timezone)
            const exp = new Date("2024-01-01T12:00" + timezoneOffset(undefined, new Date(2024,0,1))) 
              
            expect(parser.getParsedDate("2024-01-01")).toEqual(exp)   
        })
    })
})