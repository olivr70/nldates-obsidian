import { stripDiacritics } from "../../src/utils/tools"
import { flattenPrefixTree, makePrefixTree, matchAnyItem, matchPartialItem, optionalEnd, regSrc, substituteChar } from "../../src//utils/regex"

const LOC = "fr"

describe("substituteChar", () => {
    test("should preserver codepoints", () => {
        expect(substituteChar("😀🤣")).toEqual("😀🤣")
    })
})

describe("optionalEnd()", () => {
    test("should handle codepoints", () => {
        const r = optionalEnd("😀🤣")
        expect(optionalEnd("😀🤣")).toEqual("(?:😀🤣?)?")
    })
})

describe("makePrefixTree", () => {
    const frCollator = new Intl.Collator("fr")
    test("should generate flat tree if not common prefix", () => {
        const t = makePrefixTree(["abc", "def","ghi"], frCollator)
        expect(t.next.map(x => x.prefix.join(""))).toEqual(["ghi", "def", "abc"])
    })
    test("should generate a deep tree with common prefixes", () => {
        const t = makePrefixTree(["bateau","balise","batiment"], frCollator)
        expect(flattenPrefixTree(t)).toEqual(["batiment","bateau", "balise"])
    })
    test("should support collator and join alternate characters", () => {
        const t = makePrefixTree(["bateau","balise","bâtiment","bāʾ","bá"], frCollator)
        expect(flattenPrefixTree(t)).toEqual(["bāâaáʾ", "bāâaátiment","bāâaáteau", "bāâaálise", "bāâaá"])
    })
    test("should properly handle the situation where an item is the prefix of another one", () => {
        const t = makePrefixTree(["vinte","vinte e um","vinte e dois"], frCollator)
        expect(flattenPrefixTree(t)).toEqual(["vinte e um", "vinte e dois","vinte"])
    })
    test("should properly handle the situation where 2 items share", () => {
        const t = makePrefixTree(["terça-feira","terca-feira","sabado"], frCollator)
        expect(flattenPrefixTree(t)).toEqual(["terçca-feira", "sabado"])
    })
})

describe("matchAnyItem", () => {
    test("should handle list with no prefix", () => {
        const r = matchAnyItem(LOC,["abc","def","ghi"])
        const reg = new RegExp(r)
        expect(reg.exec("abc")[0]).toEqual("abc")
        expect(reg.exec("def")[0]).toEqual("def")
        expect(reg.exec("ghi")[0]).toEqual("ghi")
    })
    test("should handle list with a common prefix", () => {
        const r = matchAnyItem(LOC,["bateau","balise","batïment"].sort())
        const reg = new RegExp(r)
        expect(reg.exec("bateau")[0]).toEqual("bateau")
        expect(reg.exec("balise")[0]).toEqual("balise")
        expect(reg.exec("batïment")[0]).toEqual("batïment")
    })
    test("should make a RegExp which ignore diacritics", () => {
        const r = matchAnyItem(LOC, ["bâteau","balise","bâtïment"].sort())
        const reg = new RegExp(r)
        expect(reg.exec("bateau")).not.toBeNull()
        expect(reg.exec("bâteau")).not.toBeNull()
        expect(reg.exec("balise")).not.toBeNull()
        expect(reg.exec("bâtïment")).not.toBeNull()
    })
    test("should handle Portuguese numbers in letter", () => {
        const NUMBER_BASE_DICTIONARY_PT: { [word: string]: number } = {
            "um": 1,
            "dois": 2,
            "três": 3,
            "quatro": 4,
            "cinco": 5,
            "seis": 6,
            "sete": 7,
            "oito": 8,
            "nove": 9,
            "dez": 10,
            "onze": 11,
            "doze": 12,
            "treze": 13,
            "catorze": 14,
            "quinze": 15,
            "dezesseis": 16,
            "dezessete": 17,
            "dezoito": 18,
            "dezenove": 19,
            "vinte": 20,
            "vinte e um": 21,
            "vinte e dois": 22,
            "vinte e três": 23,
            "vinte e quatro": 24,
            "vinte e cinco": 25,
            "vinte e seis": 26,
            "vinte e sete": 27,
            "vinte e oito": 28,
            "vinte e nove": 29,
            "trinta": 30,
            "trinta e um": 31
        };

        const r = matchAnyItem(LOC,Object.keys(NUMBER_BASE_DICTIONARY_PT).sort())
        const reg = new RegExp(r)
        // check every entry, both as is and with stripped diacritics
        for (let k of Object.keys(NUMBER_BASE_DICTIONARY_PT)) {
            expect(reg.exec(k)[0]).toBe(k)
            const stripped = stripDiacritics(k)
            expect(reg.exec(stripped)[0]).toBe(stripped)

        }
    })
})



describe("matchPartialItem", () => {
    test("should handle list with no prefix", () => {
        const r = matchPartialItem(LOC,["abc","def","ghi"])
        console.log(regSrc(r))
        const reg = new RegExp(r)
        expect(reg.exec("")).toBeNull()
        expect(reg.exec("abc")[0]).toEqual("abc")
        expect(reg.exec("ab")[0]).toEqual("ab")
        expect(reg.exec("a")[0]).toEqual("a")
        expect(reg.exec("def")[0]).toEqual("def")
        expect(reg.exec("ghi")[0]).toEqual("ghi")
    })
    test("should handle list with a common prefix", () => {
        const r = matchPartialItem(LOC,["bateau","balise","batïment"].sort())
        const reg = new RegExp(r)
        expect(reg.exec("bateau")[0]).toEqual("bateau")
        expect(reg.exec("balise")[0]).toEqual("balise")
        expect(reg.exec("batïment")[0]).toEqual("batïment")
        expect(reg.exec("batea")[0]).toEqual("batea")
        expect(reg.exec("bate")[0]).toEqual("bate")
        // ambiguous prefixes are not matched
        expect(reg.exec("bat")).toBeNull()
    })
    test("should make a RegExp which ignores diacritics", () => {
        const r = matchPartialItem(LOC,["bâteau","balise","bâtiment"])
        const reg = new RegExp(r)
        expect(reg.exec("bateau")[0]).toEqual("bateau")
        expect(reg.exec("bâteau")[0]).toEqual("bâteau")
        expect(reg.exec("bate")[0]).toEqual("bate")
        expect(reg.exec("balise")[0]).toEqual("balise")
        expect(reg.exec("bâtiment")[0]).toEqual("bâtiment")
        expect(reg.exec("bâtimen")[0]).toEqual("bâtimen")
        expect(reg.exec("bâtim")[0]).toEqual("bâtim")
        expect(reg.exec("bati")[0]).toEqual("bati")
    })
    test("should handle Portuguese numbers in letter", () => {
        const NUMBER_BASE_DICTIONARY_PT: { [word: string]: number } = {
            "um": 1,
            "dois": 2,
            "três": 3,
            "quatro": 4,
            "cinco": 5,
            "seis": 6,
            "sete": 7,
            "oito": 8,
            "nove": 9,
            "dez": 10,
            "onze": 11,
            "doze": 12,
            "treze": 13,
            "catorze": 14,
            "quinze": 15,
            "dezesseis": 16,
            "dezessete": 17,
            "dezoito": 18,
            "dezenove": 19,
            "vinte": 20,
            "vinte e um": 21,
            "vinte e dois": 22,
            "vinte e três": 23,
            "vinte e quatro": 24,
            "vinte e cinco": 25,
            "vinte e seis": 26,
            "vinte e sete": 27,
            "vinte e oito": 28,
            "vinte e nove": 29,
            "trinta": 30,
            "trinta e um": 31
        };

        const r = matchPartialItem(LOC,Object.keys(NUMBER_BASE_DICTIONARY_PT))
        const reg = new RegExp(r)
        // check every entry, both as is and with stripped diacritics
        expect(reg.exec("vinte e n")[0]).toEqual("vinte e n")
        expect(reg.exec("dezo")[0]).toEqual("dezo")
    })
})
