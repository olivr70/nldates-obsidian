
import { DateDisplay } from "../../src/types"
import { hintToDisplay, parseSuggestion, REG_DISPLAY_FORMAT, REG_MOMENT_FORMAT, REG_SUGGESTION_PREFIX } from "../../src/suggest/suggest-utils"

test("hintToDisplay", () => {
    expect(hintToDisplay("time")).toEqual(DateDisplay.asTime)
    expect(hintToDisplay("tim")).toEqual(DateDisplay.asTime)
    expect(hintToDisplay("ti")).toEqual(DateDisplay.asTime)
    expect(hintToDisplay("date")).toEqual(DateDisplay.asDate)
    expect(hintToDisplay("dat")).toEqual(DateDisplay.asDate)
    expect(hintToDisplay("da")).toEqual(DateDisplay.asDate)
    expect(hintToDisplay("d")).toEqual(DateDisplay.asDate)
    expect(hintToDisplay("timestamp")).toEqual(DateDisplay.asTimestamp)
    expect(hintToDisplay("timestam")).toEqual(DateDisplay.asTimestamp)
    expect(hintToDisplay("timesta")).toEqual(DateDisplay.asTimestamp)
    expect(hintToDisplay("timest")).toEqual(DateDisplay.asTimestamp)
    expect(hintToDisplay("times")).toEqual(DateDisplay.asTimestamp)
    expect(hintToDisplay("ts")).toEqual(DateDisplay.asTimestamp)
    expect(hintToDisplay("TIME")).toEqual(DateDisplay.asTime)
    expect(hintToDisplay("DATE")).toEqual(DateDisplay.asDate)
    expect(hintToDisplay("TIMESTAMP")).toEqual(DateDisplay.asTimestamp)
    expect(hintToDisplay("TS")).toEqual(DateDisplay.asTimestamp)
})

describe("parsePrefix", () => {
    test("REG_DISPLAY_FORMAT", () => {
        expect(REG_DISPLAY_FORMAT.test("ts")).toBeTruthy()
        expect(REG_DISPLAY_FORMAT.test("timestamp")).toBeTruthy()
        expect(REG_DISPLAY_FORMAT.test("time")).toBeTruthy()
        expect(REG_DISPLAY_FORMAT.test("date")).toBeTruthy()
    })
    test("REG_MOMENT_FORMAT", () => {
        expect(REG_MOMENT_FORMAT.test("LL")).toBeTruthy()
        expect(REG_MOMENT_FORMAT.test("ll")).toBeTruthy()
        expect(REG_MOMENT_FORMAT.test("YYYY")).toBeTruthy()
        expect(REG_MOMENT_FORMAT.test("YYYY-MM")).toBeTruthy()
        expect(REG_MOMENT_FORMAT.test("YYYY-W")).toBeTruthy()
        expect(REG_MOMENT_FORMAT.test("YYYY-Q")).toBeTruthy()
        expect(REG_MOMENT_FORMAT.test("YYYYMMDD")).toBeTruthy()
    })
    test("REG_SUGGESTION_PREFIX", () => {
        const xx = REG_SUGGESTION_PREFIX;
        expect(REG_SUGGESTION_PREFIX.test("time:")).toBeTruthy()
    })
    test("should always return the text", () => {
        expect(parseSuggestion("hello")).toEqual({text:"hello"})
    })
    test("should return remaining text when prefix", () => {
        expect(parseSuggestion("YYYY-MM:hello")).toEqual({format:"YYYY-MM", text:"hello", prefix:"YYYY-MM"})
        expect(parseSuggestion("time:hello")).toEqual({display:DateDisplay.asTime, text:"hello", prefix:"time"})
        expect(parseSuggestion("LLL:hello")).toEqual({format:"long", text:"hello", prefix:"LLL"})
        expect(parseSuggestion("fr-FR:hello")).toEqual({locale:"fr-FR", text:"hello", prefix:"fr-FR"})
        expect(parseSuggestion("LL;ja:hello")).toEqual({locale:"ja", format:"medium", text:"hello", prefix:"LL;ja"})
        expect(parseSuggestion("ll;ja:hello")).toEqual({locale:"ja", format:"medium", text:"hello", prefix:"ll;ja"})
        expect(parseSuggestion("zh-Hans-CN:hello")).toEqual({locale:"zh-Hans-CN", text:"hello", prefix:"zh-Hans-CN"})
       expect(parseSuggestion("zh-Hans-CN;YYYY-MM:hello")).toEqual({locale:"zh-Hans-CN", format:"YYYY-MM", text:"hello", prefix:"zh-Hans-CN;YYYY-MM"})
    })
    test("should return main text when there is a suffix", () => {
        expect(parseSuggestion("hello@time")).toEqual({display:DateDisplay.asTime, text:"hello", suffix:"time"})
        expect(parseSuggestion("hello@LLL")).toEqual({format:"long", text:"hello", suffix:"LLL"})
        expect(parseSuggestion("hello@YYYY-MM")).toEqual({format:"YYYY-MM", text:"hello", suffix:"YYYY-MM"})
        expect(parseSuggestion("hello@fr-FR")).toEqual({locale:"fr-FR", text:"hello", suffix:"fr-FR"})
        expect(parseSuggestion("hello@zh-Hans-CN")).toEqual({locale:"zh-Hans-CN", text:"hello", suffix:"zh-Hans-CN"})
        expect(parseSuggestion("hello@zh-Hans-CN;YYYY-MM")).toEqual({locale:"zh-Hans-CN", format:"YYYY-MM", text:"hello", suffix:"zh-Hans-CN;YYYY-MM"})
        expect(parseSuggestion("hello@ll;ja")).toEqual({locale:"ja", format:"ll", text:"hello", suffix:"ll;ja"})
    })
})