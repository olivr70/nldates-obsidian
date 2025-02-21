import { charToCodepoint, codepointToChar, lengthCp, substringCp } from "../../src/utils/unicode"
import { categoryOf } from "../../src/utils/u-categoryOf"

describe("unicode generated", () => {
    test("categoryOf", () => {
        expect(categoryOf("A")).toEqual("Cased_Letter")
        expect(categoryOf("a")).toEqual("Cased_Letter")
        expect(categoryOf("1")).toEqual("Cased_Letter")
        expect(categoryOf(",")).toEqual("Cased_Letter")
        expect(categoryOf(" ")).toEqual("Cased_Letter")
    })
})


describe("codepointToChar", () => {
    test("should support simple chars", () => {
        expect(codepointToChar("abc", 2)).toBe(2)
    })
    test("should return -1 if out of bounds", () => {
        expect(codepointToChar("abc", 4)).toBe(-1)
    })
    test("should support simple chars", () => {
        expect(codepointToChar("😀🤣", 0)).toBe(0)
        expect(codepointToChar("😀🤣", 1)).toBe(2)
    })
})

describe("charToCodepoint", () => {
    test("should support simple chars", () => {
        expect(charToCodepoint("abc", 2)).toBe(2)
    })
    test("should return -1 if out of bounds", () => {
        expect(charToCodepoint("abc", 4)).toBe(-1)
    })
    test("should support simple chars", () => {
        expect(charToCodepoint("😀🤣", 0)).toBe(0)
        expect(charToCodepoint("😀🤣", 1)).toBe(0)
        expect(charToCodepoint("😀🤣", 2)).toBe(1)
    })
})

describe("substringCp", () => {
    test("should handle normal string", () => {
        expect(substringCp("abcd")).toEqual("abcd")
        expect(substringCp("abcd",2)).toEqual("cd")
        expect(substringCp("abcd",1,3)).toEqual("bc")
    })
    test("should handle string wit surrogate pairs", () => {
        expect(substringCp("😀🤣😇🤩")).toEqual("😀🤣😇🤩")
        expect(substringCp("😀🤣😇🤩",2)).toEqual("😇🤩")
        expect(substringCp("😀🤣😇🤩",1,3)).toEqual("🤣😇")
    })
    test("should handle mixed string", () => {
        expect(substringCp("a😀b🤣c😇d🤩",1,5)).toEqual("😀b🤣c")
    })
})

describe("lengthCp", () => {
    test("should handle normal string", () => {
        expect(lengthCp("abcd")).toBe(4)
    })
    test("should handle string wit surrogate pairs", () => {
        expect(lengthCp("😀🤣😇🤩")).toBe(4)
    })
    test("should handle mixed string", () => {
        expect(lengthCp("a😀b🤣c😇d🤩")).toBe(8)
    })
    test("should not handle combining characters", () => {
        const mixed = "😀🤣😇🤩\u0301\u200C\u0302\u200C\u0303\u200C\u0304"
        const mixed2 = "😀🤣😇🤩\u0301 \u0302 \u0303 \u0304"
        console.log(mixed.normalize("NFC"))
        console.log(mixed2.normalize("NFC"))
        expect(lengthCp("😀🤣😇🤩\u0301\u200C\u0302\u200C\u0303\u200C\u0304")).toBe(11)
    })
})