import { i18nString, i18nObject, i18n } from "typesafe-i18n"
import de from "../../src/i18n/de/index"
import en from "../../src/i18n/en/index"
import fr from "../../src/i18n/fr/index"

function my_i18n() {
    return i18n({de,en,fr}, {de:{}, en:{}, fr:{}})
}

describe("i18nString", () => {
    test("should substitue", () => {
        const LLL = i18nString("fr")
        expect(LLL("Hello")).toEqual("Hello")
        expect(LLL("Hello {name}", { name:"world"})).toEqual("Hello world")
        expect(LLL("Hello {0}", { 0:"world"})).toEqual("Hello world")
    })
})

describe("i18nObject", () => {
    test("should substitue", () => {
        const LLL_en = i18nObject("en", { HI: "Hello {who: string}"})
        const LLL_fr = i18nObject("fr", { HI: "Bonjour {who: string}"})
        expect(LLL_en.HI({who:"world"})).toEqual("Hello world")
        expect(LLL_fr.HI({who:"world"})).toEqual("Bonjour world")
    })
    test("should substitute", () => {
        const LLL_en = i18nObject("en", { localeDescriptionWithRegion: "{language} in {region}"})
        const LLL_fr = i18nObject("fr", { localeDescriptionWithRegion: "{language} - {region}"})
        expect(LLL_en.localeDescriptionWithRegion({language:"French", region:"France"})).toEqual("French in France")
        expect(LLL_fr.localeDescriptionWithRegion({language:"français", region:"France"})).toEqual("français - France")
    })
    test("should substitute in a subobject", () => {
        const LLL_en = i18nObject("en", { utils: { intl: { localeDescriptionWithRegion: "{language} in {region}"}}})
        const LLL_fr = i18nObject("fr", { utils: { intl: { localeDescriptionWithRegion: "{language} - {region}"}}})
        expect(LLL_en.utils.intl.localeDescriptionWithRegion({language:"French", region:"France"})).toEqual("French in France")
        expect(LLL_fr.utils.intl.localeDescriptionWithRegion({language:"français", region:"France"})).toEqual("français - France")
    })
    test("should support transformers", () => {
        const transfo = { uppercase: (x:string) => x.toUpperCase()}
        const LLL_en = i18nObject("en", { HI: "Hello {who: string|uppercase}"}, transfo)
        expect(LLL_en.HI({who:"world"})).toEqual("Hello WORLD")

    })
})
describe("i18n", () => {
    // using the i18n obejct, initialized with all locales
    const transfo = { uppercase: (x:string) => x.toUpperCase()}
    let L:any

    beforeAll(() => {
        L = my_i18n()
    })
    test("should substitue HI", () => {
        expect(L.en.HI({name:"world"})).toEqual("Hi world")
        expect(L.de.HI({name:"world"})).toEqual("Hallo world")
        expect(L.fr.HI({name:"world"})).toEqual("Bonjour world")
    })
    test("should substitue localeDescriptionWithRegion", () => {
        expect(L.de.utils.intl.localeDescriptionWithRegion({language:"Franzôsich", region:"Frankreich"})).toEqual("Franzôsich in Frankreich")
        expect(L.en.utils.intl.localeDescriptionWithRegion({language:"French", region:"France"})).toEqual("French in France")
        expect(L.fr.utils.intl.localeDescriptionWithRegion({language:"français", region:"France"})).toEqual("français - France")
    })
    test("should support commands", () => {
        const xx = L.fr.commands.INSERT_CURRENT_DATE()
        expect(L.fr.commands.INSERT_CURRENT_DATE()).toEqual("Insérer la date du jour")
    })
})