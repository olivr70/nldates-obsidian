import { parse } from "path"
import { getIntlWeekInfo, parseLocale, REG_LOCALE, startsWithUsingCollator } from "../../src/utils/intl"

describe("utils/Intl", () => {
    test("getIntlWeekInfo() should return week info", () => {
        expect(getIntlWeekInfo("fr-FR")?.firstDay).toEqual(1)
        expect(getIntlWeekInfo("es-ES")?.firstDay).toEqual(1)
        expect(getIntlWeekInfo("en-US")?.firstDay).toEqual(0)
        expect(getIntlWeekInfo("en-MX")?.firstDay).toEqual(0) // Mexico
        expect(getIntlWeekInfo("fr-CA")?.firstDay).toEqual(0) // Canada
        expect(getIntlWeekInfo("he-IL")?.firstDay).toEqual(0) // Israël
        expect(getIntlWeekInfo("pt-BR")?.firstDay).toEqual(0) // Brazil
        expect(getIntlWeekInfo("ar-DZ")?.firstDay).toEqual(6) // Algeria
    })
})

describe('parseLocale', () => {
    test("should parse langugage codes", () => {
        expect(parseLocale("fr")).toEqual({lang:"fr", locale:"fr"})
        expect(parseLocale("byn")).toEqual({lang:"byn", locale:"byn"})
    })
    test("should not detect in words", () => {
        expect(() => parseLocale("france")).toThrow(RangeError)
        expect(() => parseLocale("coffre")).toThrow(RangeError)
        expect(() => parseLocale("souffr")).toThrow(RangeError)
    })
    test("should be case sensitive", () => {
        expect(() => parseLocale("FR")).toThrow(RangeError)
    })
    test("should parse country codes", () => {
        expect(parseLocale("fr-CA")).toEqual({lang:"fr", region:"CA", locale:"fr-CA"})
    })
    test("using scripts", () => {
        expect(parseLocale("fr-Latn")).toEqual({lang:"fr", script:"Latn", locale:"fr-Latn"})
        expect(parseLocale("ru-Cyrl")).toEqual({lang:"ru", script:"Cyrl", locale:"ru-Cyrl"})
        expect(parseLocale("fr-Latn-FR")).toEqual({lang:"fr", script:"Latn", region:"FR", locale:"fr-Latn-FR"})
        expect(parseLocale("ja-Hans-JP")).toEqual({lang:"ja", script:"Hans", region:"JP", locale:"ja-Hans-JP"})
    })
    test("using extensions", () => {
        expect(parseLocale("he-IL-u-ca-hebrew-tz-jeruslm")).toEqual({lang:"he", region:"IL", extensions:"u-ca-hebrew-tz-jeruslm", locale:"he-IL-u-ca-hebrew-tz-jeruslm"})
    })
})

describe("Collators", () => {
    describe("startsWithUsingCollator()", () => {
        const frBase = new Intl.Collator("fr", { sensitivity: "base"})
        const frStric = new Intl.Collator("fr", { sensitivity: "variant"})
        test("should detect", () => {
            expect(startsWithUsingCollator("bateau", "ba", frBase)).toBeTruthy()
            expect(startsWithUsingCollator("bateau", "bateau", frBase)).toBeTruthy()
            expect(startsWithUsingCollator("bateau", "", frBase)).toBeTruthy()
        })
        test("should fail on", () => {
            expect(startsWithUsingCollator("bateau", "brume", frBase)).toBeFalsy()
            expect(startsWithUsingCollator("bateau", "bateau mouche", frBase)).toBeFalsy()
        })
        test("should support lenient collators", () => {
            expect(startsWithUsingCollator("bébé", "BE", frBase)).toBeTruthy()
        })
    })
})