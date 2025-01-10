import { parse } from "path"
import { getIntlWeekInfo, parseLocale, REG_LOCALE } from "../../src/utils/intl"

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
        expect(parseLocale("fr")).toEqual({lang:"fr"})
        expect(parseLocale("byn")).toEqual({lang:"fr"})
    })
    test("should not detect in words", () => {
        expect(parseLocale("france")).toBe(null)
        expect(parseLocale("coffre")).toBe(null)
        expect(parseLocale("souffr")).toBe(null)
    })
    test("should be case sensitive", () => {
        expect(parseLocale("FR")).toBe(null)
    })
    test("should parse country codes", () => {
        expect(parseLocale("fr-CA")).toEqual({lang:"fr", country:"CA"})
    })
    test("using scripts", () => {
        expect(parseLocale("fr-Latn")).toEqual({lang:"fr", script:"Latn"})
        expect(parseLocale("ru-Cyrl")).toEqual({lang:"ru", script:"Cyrl"})
        expect(parseLocale("fr-Latn-FR")).toEqual({lang:"fr", script:"Latn", country:"FR"})
        expect(parseLocale("ja-Hans-JP")).toEqual({lang:"ja", script:"Hans", country:"JP"})
    })
    test("using extensions", () => {
        expect(parseLocale("he-IL-u-ca-hebrew-tz-jeruslm")).toEqual({lang:"he", country:"IL", extensions:"-u-ca-hebrew-tz-jeruslm"})
    })
})