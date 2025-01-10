
import { parseIsoDateEra, parseIsoTime, parseIsoTimestampEra, parseIsoTimeTzd, parseTzd } from "../../../src/locales/common/constants"

describe('IsoEra', () => {
    describe('Tzd', () => {
        test('should accept Z', () => {
            expect(parseTzd("Z")).toEqual(0)
        })
        test('should accept hours only', () => {
            expect(parseTzd("+01")).toEqual(60)
            expect(parseTzd("+03")).toEqual(180)
            expect(parseTzd("-05")).toEqual(-300)
        })
        test('should accept hours and minutes', () => {
            expect(parseTzd("+01:15")).toEqual(75)
            expect(parseTzd("+03:00")).toEqual(180)
            expect(parseTzd("-05:45")).toEqual(-345)
        })
    })
    describe('IsoTime', () => {
        test('should parse full time', () => {
            expect(parseIsoTime("11:35:45")).toEqual({hour:11, minute:35, second:45})
            expect(parseIsoTime("11:35:45.2")).toEqual({hour:11, minute:35, second:45, millisecond: 200})
            expect(parseIsoTime("11:35:45.21")).toEqual({hour:11, minute:35, second:45, millisecond: 210})
            expect(parseIsoTime("11:35:45.217")).toEqual({hour:11, minute:35, second:45, millisecond: 217})
            expect(parseIsoTime("11:35:45.2178")).toEqual({hour:11, minute:35, second:45, millisecond: 217})
        })
        test('should parse partial times', () => {
            expect(parseIsoTime("11:35")).toEqual({hour:11, minute:35})
        })
        test('should reject invalid times', () => {
            expect(parseIsoTime("11")).toEqual({})
            expect(parseIsoTime("111:35")).toEqual({})
        })
    })
    describe('IsoDateEra', () => {
        test('should parse positive years', () => {
            expect(parseIsoDateEra("+1512-03-15")).toEqual({year:1512, month:3, day: 15})
            expect(parseIsoDateEra("+2024-03-15")).toEqual({year:2024, month:3, day: 15})
        })
        test('should parse negative years', () => {
            expect(parseIsoDateEra("-10501-03-15")).toEqual({year:-10501, month:3, day: 15})
        })
        test('should parse year 0', () => {
            expect(parseIsoDateEra("+0000-03-15")).toEqual({year:-1, month:3, day: 15})
            expect(parseIsoDateEra("+000000-03-15")).toEqual({year:-1, month:3, day: 15})
            expect(parseIsoDateEra("+0000-03-15")).toEqual({year:-1, month:3, day: 15})
        })
        test('should ignore standard ISO dates', () => {
            expect(parseIsoDateEra("2024-03-15")).toEqual({})
            
        })
    })
    describe('IsoTimeTzd', () => {
        test('should parse timezone offsets', () => {
            expect(parseIsoTimeTzd("11:35:52.1+01:45")).toEqual({hour:11, minute:35, second:52,millisecond:100, timezoneOffset:105})
            expect(parseIsoTimeTzd("11:35+02")).toEqual({hour:11, minute:35, timezoneOffset:120})
        })
    })
    describe('IsoTimestampEra', () => {
        test('should parse timestamps', () => {
            expect(parseIsoTimestampEra("+2024-03-15T11:35:52.1+01:45"))
                .toEqual({year:2024, month:3, day: 15, hour:11, minute:35, second:52, millisecond:100, timezoneOffset:105})
        })
        
    })
})