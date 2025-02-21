import { findInDict, findPartialInDict } from "../../src/utils/months"

describe("findInDict", () => {
    const DAYS = { monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6, sunday:7 }
    const BASE = new Intl.Collator("en", { sensitivity:"base"})
    const CASE = new Intl.Collator("en", { sensitivity:"case"})
    const ACCENT = new Intl.Collator("en", { sensitivity:"accent"})
    const VARIANT = new Intl.Collator("en", { sensitivity:"variant"})
    test("should work with identical", () => {
        expect(findInDict(DAYS, "sunday", NaN, [ VARIANT])).toEqual(7)
    })
    test("should work with identical", () => {
        expect(findInDict(DAYS, "SATURDAY", NaN, [ CASE])).toBeNaN()
        expect(findInDict(DAYS, "Friday", NaN, [ CASE])).toBeNaN()
        expect(findInDict(DAYS, "SATURDAY", NaN, [ BASE])).toEqual(6)
        expect(findInDict(DAYS, "Friday", NaN, [ BASE])).toEqual(5)
    })
    test("should handle numerci collators", () => {
        const NUMBER = new Intl.Collator('en', { numeric:true})
        const NUMS = { "10": 1, "010": 1, "100": 2, "1000" : 3}
        expect(findInDict(NUMS, "10", NaN, [ NUMBER ])).toEqual(1)
        expect(findInDict(NUMS, "010", NaN, [ NUMBER ])).toEqual(1)
        expect(findInDict(NUMS, "00010", NaN, [ NUMBER ])).toEqual(1)
    })
    test("should handle ignore punctuation collators", () => {
        const NO_PUNCT = new Intl.Collator('en', { ignorePunctuation: true})
        expect(findInDict(DAYS, "monday.", NaN, [ NO_PUNCT ])).toEqual(1)
        expect(findInDict(DAYS, "(monday)", NaN, [ NO_PUNCT ])).toEqual(1)
        expect(findInDict(DAYS, ":monday;", NaN, [ NO_PUNCT ])).toEqual(1)
        expect(findInDict(DAYS, "mon-day", NaN, [ NO_PUNCT ])).toEqual(1)
    })
    test("should handle ignore punctuation collators", () => {
        const NO_PUNCT_BASE = new Intl.Collator('en', { ignorePunctuation: true, sensitivity:"base"})
        expect(findInDict(DAYS, "mOnday.", NaN, [ NO_PUNCT_BASE ])).toEqual(1)
        expect(findInDict(DAYS, "(Monday)", NaN, [ NO_PUNCT_BASE ])).toEqual(1)
        expect(findInDict(DAYS, ":MONDAY;", NaN, [ NO_PUNCT_BASE ])).toEqual(1)
        expect(findInDict(DAYS, "moN-Day", NaN, [ NO_PUNCT_BASE ])).toEqual(1)
    })
    test("should accept Collators with caseFirst option, ", () => {
        const UPPER_FIRST = new Intl.Collator('en', { caseFirst:"upper", sensitivity:"base"})
        expect(findInDict(DAYS, "mOnday", NaN, [ UPPER_FIRST ])).toEqual(1)
        expect(findInDict(DAYS, "Monday", NaN, [ UPPER_FIRST ])).toEqual(1)
        expect(findInDict(DAYS, "MONDAY", NaN, [ UPPER_FIRST ])).toEqual(1)
        expect(findInDict(DAYS, "moNDay", NaN, [ UPPER_FIRST ])).toEqual(1)
    })
})


describe("findPartialInDict", () => {
    const DAYS = { monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6, sunday:7 }
    const PARTIALDAYS = { mon:1, monday:1, tue:2, tuesday:2, wed:3, wednesday:3, thu:4, thursday:4 }
    const BASE = new Intl.Collator("en", { sensitivity:"base"})
    const CASE = new Intl.Collator("en", { sensitivity:"case"})
    const ACCENT = new Intl.Collator("en", { sensitivity:"accent"})
    const VARIANT = new Intl.Collator("en", { sensitivity:"variant"})
    test("should work with identical", () => {
        expect(findPartialInDict(PARTIALDAYS, "monday", NaN, [ VARIANT])).toEqual(1)
        expect(findPartialInDict(PARTIALDAYS, "mon", NaN, [ VARIANT])).toEqual(1)
        expect(findPartialInDict(PARTIALDAYS, "mo", NaN, [ VARIANT])).toEqual(1)
    })
    test("should work base collator", () => {
        expect(findPartialInDict(PARTIALDAYS, "MOND", NaN, [ CASE])).toBeNaN()
        expect(findPartialInDict(PARTIALDAYS, "Mond", NaN, [ CASE])).toBeNaN()
        expect(findPartialInDict(PARTIALDAYS, "MOND", NaN, [ BASE])).toEqual(1)
        expect(findPartialInDict(PARTIALDAYS, "Mond", NaN, [ BASE])).toEqual(1)
    })
    test("should work base collator", () => {
        expect(findPartialInDict(PARTIALDAYS, "MOND", NaN, [ CASE])).toBeNaN()
        expect(findPartialInDict(PARTIALDAYS, "Mond", NaN, [ CASE])).toBeNaN()
        expect(findPartialInDict(PARTIALDAYS, "MOND", NaN, [ BASE])).toEqual(1)
        expect(findPartialInDict(PARTIALDAYS, "Mond", NaN, [ BASE])).toEqual(1)
    })
    test("should work with multiple collators", () => {
        expect(findPartialInDict(PARTIALDAYS, "MOND", NaN, [ VARIANT, CASE])).toBeNaN()
        expect(findPartialInDict(PARTIALDAYS, "MOND", NaN, [ VARIANT, BASE])).toEqual(1)
    })
})