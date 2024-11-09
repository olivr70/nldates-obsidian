import { RELATIVE_DAY } from "../../src/types"
import { computeRelativeDay, getISOWeekNumber } from "../../src/utils/weeks"

import "../date-equality"
import dayjs from "dayjs"

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

describe('computeRelativeDay', () => {
    test('NEXT_OCCURING', () => {
        // on friday (5), next tuesday (2) : 7 + 2 - 5 = 4
        expect(computeRelativeDay(2,RELATIVE_DAY.NEXT_OCCURING, dayjs(new Date(2024,0,12)))).toEqual(new Date(2024,0,16))
            // on monday (1), next tuesday (2) : 7 + 2 - 1 = 8 = 1
        expect(computeRelativeDay(2,RELATIVE_DAY.NEXT_OCCURING, dayjs(new Date(2024,0,8)))).toEqual(new Date(2024,0,9))
            // on monday (1), next monday (1) : 7 + 1 - 1 = 7
        expect(computeRelativeDay(1,RELATIVE_DAY.NEXT_OCCURING, dayjs(new Date(2024,0,8)))).toEqual(new Date(2024,0,15))
    })
    describe('PREVIOUS_OCCURING', () => {
        test('in same month', () => {
            // on friday (5), previous tuesday (2) : 5 - 2 = 3
            expect(computeRelativeDay(2,RELATIVE_DAY.PREVIOUS_OCCURING, dayjs(new Date(2024,0,12))))
                .toEqual(new Date(2024,0,9))
            // on monday (1), previous tuesday (2) : 7 + 1-2 = 6
            expect(computeRelativeDay(2,RELATIVE_DAY.PREVIOUS_OCCURING, dayjs(new Date(2024,0,8))))
                .toEqual(new Date(2024,0,2))
            // on monday (1), previous monday (1) : 7 + 1 - 1 = 7 
            expect(computeRelativeDay(1,RELATIVE_DAY.PREVIOUS_OCCURING, dayjs(new Date(2024,0,8))))
                .toEqual(new Date(2024,0,1))
        })
        test('year overlaps', () => {
            // on tuesday (2), previous friday (2) : 7 + 2 - 5 = 4
            expect(computeRelativeDay(5,RELATIVE_DAY.PREVIOUS_OCCURING, dayjs(new Date(2024,0,2))))
                .toEqual(new Date(2023,11,29))
            // on monday (1), previous tuesday (2) : 7 + 1-2 = 6
            expect(computeRelativeDay(2,RELATIVE_DAY.PREVIOUS_OCCURING, dayjs(new Date(2024,0,1))))
                .toEqual(new Date(2023,11,26))
            // on monday (1), previous monday (1) : 7 + 1 - 1 = 7 
            expect(computeRelativeDay(1,RELATIVE_DAY.PREVIOUS_OCCURING, dayjs(new Date(2024,0,1))))
                .toEqual(new Date(2023,11,25))
        })
    })
    
    test('OF_NEXT_WEEK', () => {
        // on friday (5), next tuesday (2) : 
        expect(computeRelativeDay(2,RELATIVE_DAY.OF_NEXT_WEEK, dayjs(new Date(2024,0,12))))
            .toEqual(new Date(2024,0,16))
        // on monday (1), tuesday of next week (2) : 
        expect(computeRelativeDay(2,RELATIVE_DAY.OF_NEXT_WEEK, dayjs(new Date(2024,0,8))))
            .toEqual(new Date(2024,0,16))
            // on monday (1), next monday (1) : 7 + 1 - 1 = 7
        expect(computeRelativeDay(1,RELATIVE_DAY.OF_NEXT_WEEK, dayjs(new Date(2024,0,8))))
            .toEqual(new Date(2024,0,15))
    })
    
    test('OF_PREVIOUS_WEEK', () => {
        // on friday (5), tuesday of previous week (2) : 
        expect(computeRelativeDay(2,RELATIVE_DAY.OF_PREVIOUS_WEEK, dayjs(new Date(2024,0,12))))
            .toEqual(new Date(2024,0,2))
        // on monday (1), tuesday of previous week (2) : 
        expect(computeRelativeDay(2,RELATIVE_DAY.OF_PREVIOUS_WEEK, dayjs(new Date(2024,0,8))))
            .toEqual(new Date(2024,0,2))
            // on monday (1), monday of previous week (1) : 7 + 1 - 1 = 7
        expect(computeRelativeDay(1,RELATIVE_DAY.OF_PREVIOUS_WEEK, dayjs(new Date(2024,0,8))))
            .toEqual(new Date(2024,0,1))
    })
})