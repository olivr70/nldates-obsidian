import { getISOWeekNumber } from "../../src/utils/weeks"

import "../date-equality"

describe('getISOWeekNumber()', () => {
    test('should handle simple cases', () => {
        expect(getISOWeekNumber(new Date(2024,0,1))).toEqual([2024,1])
        expect(getISOWeekNumber(new Date(2024,0,8))).toEqual([2024,2])
    })
    test('should handle edge cases', () => {
        // 2020 had 53 weeks
        expect(getISOWeekNumber(new Date(2020,11,28))).toEqual([2020,53])
        expect(getISOWeekNumber(new Date(2021,0,1))).toEqual([2020,53])
        // 2025 week 1 starts in december 2024
        expect(getISOWeekNumber(new Date(2025,0,1))).toEqual([2025,1])
        expect(getISOWeekNumber(new Date(2024,11,30))).toEqual([2025,1])
        // week 52 of 2022 ends on sunday 1st of January 2023
        expect(getISOWeekNumber(new Date(2023,0,1))).toEqual([2022,52])
    })
})