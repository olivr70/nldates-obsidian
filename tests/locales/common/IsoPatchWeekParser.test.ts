
import { parseIsoWeekDate, parseIsoWeekDateTzd, parseTzd } from "../../../src/locales/common/constants"

describe('IsoPatchWeekParser', () => {
    test('parseTzd', () => {
        expect(parseTzd("Z")).toEqual(0)
        expect(parseTzd("+01")).toEqual(60)
        expect(parseTzd("-02")).toEqual(-120)
        expect(parseTzd("-02:45")).toEqual(-165)
    })
    describe('parseIso', () => {
        test('should match Year and week', () => {
            expect(parseIsoWeekDateTzd("2024-W01")).toEqual({year:2024,month:1,day:1})
            expect(parseIsoWeekDateTzd("2024W01")).toEqual({year:2024,month:1,day:1})
            expect(parseIsoWeekDateTzd("2024-W52")).toEqual({year:2024,month:12,day:23})
        })
        test('should signed years', () => {
            expect(parseIsoWeekDateTzd("+2024-W01")).toEqual({year:2024,month:1,day:1})
            expect(parseIsoWeekDateTzd("-0100-W01")).toEqual({year:-100,month:1,day:1})
        })
        test('should handle year limit', () => {
            expect(parseIsoWeekDateTzd("2025-W01")).toEqual({year:2024,month:12,day:30})
        })
        test('should handle day in week', () => {
            expect(parseIsoWeekDateTzd("2024-W01-1")).toEqual({year:2024,month:1,day:1})
            expect(parseIsoWeekDateTzd("2024-W01-2")).toEqual({year:2024,month:1,day:2})
            // sunday of week 6
            expect(parseIsoWeekDateTzd("2024-W06-1")).toEqual({year:2024,month:2,day:5})
            expect(parseIsoWeekDateTzd("2024-W06-2")).toEqual({year:2024,month:2,day:6})
            expect(parseIsoWeekDateTzd("2024-W06-3")).toEqual({year:2024,month:2,day:7})
            expect(parseIsoWeekDateTzd("2024-W06-4")).toEqual({year:2024,month:2,day:8})
            expect(parseIsoWeekDateTzd("2024-W06-5")).toEqual({year:2024,month:2,day:9})
            expect(parseIsoWeekDateTzd("2024-W06-6")).toEqual({year:2024,month:2,day:10})
            expect(parseIsoWeekDateTzd("2024-W06-7")).toEqual({year:2024,month:2,day:11})

        })
        test('should handle timezone offsets', () => {
            expect(parseIsoWeekDateTzd("2025-W01Z")).toEqual({year:2024,month:12,day:30, timezoneOffset:0})
            expect(parseIsoWeekDateTzd("2025-W01+01")).toEqual({year:2024,month:12,day:30, timezoneOffset:60})
            expect(parseIsoWeekDateTzd("2025-W01-02:45")).toEqual({year:2024,month:12,day:30, timezoneOffset:-165})
        })
        test("should not recognize ill formed week dates", () => {
            expect(parseIsoWeekDateTzd("2024-W99")).toEqual({})
        })
    })
    describe('parseIsoWeekDateParser', () => {
        test('should parse with no day', () => {
            expect(parseIsoWeekDate("2024-W01")).toEqual({year:2024, month:1, day:1})
            expect(parseIsoWeekDate("2025-W01")).toEqual({year:2024, month:12, day:30})
        })
        test('should parse with a day number', () => {
            expect(parseIsoWeekDate("2024-W01-1")).toEqual({year:2024, month:1, day:1})
            expect(parseIsoWeekDate("2025-W01-1")).toEqual({year:2024, month:12, day:30})
            expect(parseIsoWeekDate("2025-W01-3")).toEqual({year:2025, month:1, day:1})
        })
    })
})