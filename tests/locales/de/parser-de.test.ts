import dayjs from "dayjs";
import NLDParserDe from "../../../src/locales/de/parser-de";
import { parseMonthNameDe } from "../../../src/locales/de/constants-de";





describe("parseMonthNameDe() should", () => {
    test("match long names", () => {
        expect(parseMonthNameDe("März")).toBe(2);
    })
    test("match lowercase names", () => {
        expect(parseMonthNameDe("märz")).toBe(2);
    })
    test("match stripped names", () => {
        expect(parseMonthNameDe("marz")).toBe(2);
    })
    test("match short names", () => {
        expect(parseMonthNameDe("mar")).toBe(2);
    })

})

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