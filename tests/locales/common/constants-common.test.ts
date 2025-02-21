import { parseIsoDateEra, parseIsoTime, parseIsoTimeTzd, parseIsoWeekDateTzd, parseTzd, DAY_IN_MONTH_REG, YEAR_VALUE_4_REG, YEAR_VALUE_REG } from "../../../src/locales/common/constants"
import { testFullMatches, testMap, testNoMatches, testPartialMatches } from "../../regexTestTools"


describe("REG_DAY_IN_MONTH", () => {
    testFullMatches(DAY_IN_MONTH_REG, "1", "9", "02", "03", "21", "31")
    testNoMatches(DAY_IN_MONTH_REG, "32", "99", "00","A31","19B","199")
    testPartialMatches(DAY_IN_MONTH_REG, "(31)", "/21/", "月28日")
})
describe("YEAR_VALUE_4_REG", () => {
    testFullMatches(YEAR_VALUE_4_REG, "1921", "2043", "0025", "1801")
    testNoMatches(YEAR_VALUE_4_REG, "0000", "921", "20430", "02025", "A1925","1930B")
    testPartialMatches(YEAR_VALUE_4_REG, "(1921)", "/2022", "2025/", "2025年")
})
describe("YEAR_VALUE_REG", () => {
    testFullMatches(YEAR_VALUE_REG, "1", "1921", "204", "25", "1801")
    testNoMatches(YEAR_VALUE_REG, "0", "00", "000", "0000", "20430","A1925","1930B","A921","211B")
    testPartialMatches(YEAR_VALUE_REG, "(1921)", "/222", "225/", "225年")
})
describe("parseTzd", () => {
    testMap(parseTzd, ["Z", 0], ["+01", 60], ["-02:15", -135])
})
describe("parseIsoTime", () => {
    testMap(parseIsoTime, 
        ["13:27", {hour:13, minute:27}],
        ["02:15Z", {hour:2, minute:15, timezoneOffset:0}],
        ["00:01.000", {hour:0,minute:1,millisecond:0}],
        ["00:09:00.1234", {hour:0,minute:9,second:0,millisecond:123}],
        ["00:09:00.123999", {hour:0,minute:9,second:0, millisecond:123}],
        ["00:01.92", {hour:0,minute:1,millisecond:920}],
        ["10:11", {hour:10, minute:11}], 
        ["23:59.4", {hour:23,minute:59,millisecond:400}],
        ["01:02.999", {hour:1,minute:2,millisecond:999}]
    )
    testMap(parseIsoTime, 
        ["(10:11)", {hour:10, minute:11}], 
        ["(10:11+01:00)", {hour:10, minute:11}],    // timezone is ignored
        ["AAAA", {}]
    )
})
describe("parseIsoTimeTzd", () => {
    describe("should parse", () => {
        testMap(parseIsoTimeTzd, 
            ["10:11+02", {hour:10, minute:11, timezoneOffset:120}], 
            ["10:11-03:15", {hour:10, minute:11, timezoneOffset:-195}], 
            ["23:59:00.4-03", {hour:23,minute:59,second:0,millisecond:400, timezoneOffset:-180}]
        )
        testMap(parseIsoTimeTzd, 
            ["(10:11+01)", {hour:10, minute:11}], 
            ["(10:11+01:00)", {hour:10, minute:11, timezoneOffset:60}]
        )

    })
    describe("should reject", () => {
        testMap(parseIsoTimeTzd, 
            ["23", {}], // a single number is not a time
            ["25:11+02", {}], // hours are in the 0-23 range
            ["AAAA", {}] // a text should not be matches
        )

    })
    describe("should match partially", () => {
        testMap(parseIsoTimeTzd, 
            ["23:59.125", {hour:23, minute:59}], // milliseconds can only follow seconds
            ["25:11+02", {}], // hours are in the 0-23 range
            ["AAAA", {}] // a text should not be matches
        )

    })
})
describe("parseIsoDateEra", () => {
    describe("should support", () => {
        testMap(parseIsoDateEra, 
            ["+10000-12-23", {year:10000, month:12, day:23}], 
            ["+234000-01-01", {year:234000, month:1, day:1}],
            ["-0050-02-14", {year:-50, month:2, day:14}], 
            ["-0050-02", {year:-50, month:2}],
            ["-0050", {year:-50}]
        )
    })
    describe("should reject", () => {
        testMap(parseIsoDateEra, 
            ["10000-12-23", {}], // sign is required
            ["+50-02-14", {}], // year must have between 4 and 6 digits
        )
    })

})

describe("parseIsoWeekDateTzd", () => {
    testMap(parseIsoWeekDateTzd, 
        ["2025-W01", {year:2024, month:12, day:30}], // handles week 1 beginning on previous year
        ["2024-W01", {year:2024, month:1, day:1}], // handles week 1 beginning on previous year
        ["2015-W01", {year:2014, month:12, day:29}], // handles week 53
        ["2020-W53", {year:2020, month:12, day:28}], // handles week 53
        ["2020-W53-7", {year:2021, month:1, day:3}], // handles week 53
    )

})