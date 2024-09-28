import * as chrono from "chrono-node";
import { Chrono } from "chrono-node";
import dayjs, { Dayjs } from "dayjs";

import objectSupport from "dayjs/plugin/objectSupport"

import "../date-equality"

dayjs.extend(objectSupport);

describe('ISOFormatParser should parse', () => {
    let C:Chrono;
    let ref:Dayjs;
    let refDate:Date = new Date(2024,5,17,12,0); // a monday;
    let parseDate = (str:string) => C.parseDate(str, refDate)
    let parse = (str:string):chrono.ParsedResult[] => C.parse(str, refDate)

    beforeAll(() => {
        C = new Chrono(chrono.de.createCasualConfiguration(true));
        // ref date is June 17th 2024 at 12:00
        ref = dayjs(refDate);
      });

    describe.skip("Unsupported ISO features", () => {
        test('ISo weeks are not supported', () => {
            const  x = parseDate("2024-W01")
            expect(parseDate("2024-W01")).toEqual(new Date(Date.UTC(2024,0,1)))
            expect(parseDate("2024W01")).toEqual(new Date(Date.UTC(2024,0,1)))
        })
        test('ISo day in years are not supported', () => {
            const  x = parseDate("2024-001")
            expect(parseDate("2024-001")).toEqual(new Date(Date.UTC(2024,0,1)))
        })
        test('ISo weeks with days are not supported', () => {
            const  x = parseDate("2024-W02-1") // first day of first week
            expect(parseDate("2024-W02-1")).toEqual(new Date(Date.UTC(2024,0,8)))
        })
        test('Time only are not supported', () => {
            const  x = parseDate("T20:10")
            expect(parseDate("T20:10")).toEqual(new Date(Date.UTC(2024,0,1,20,10)))
        })
        test('ISO periods are not supported', () => {
            const  x = parse("2014-01-01/2024-01-08") // 8 
            expect(x.length).toBe(1)    // a single result, not 2 dates
            expect(x[0].end).not.toBeNull()
            expect(x[0].end.date).toEqual(new Date(Date.UTC(2024,0,8)))
        })
        
        test('ISo extended years are not supported', () => {
            expect(parseDate("+10000-01-02")).toEqual(new Date(10000,0,2,12))
            expect(parseDate("-0001-01-02")).toEqual(dayjs({year:-1,month:1,day:2}))
            expect(parseDate("-00001-01-02")).toEqual(dayjs({year:-1,month:1,day:2}))
        })
    })
    describe.skip('potential bugs in ISO Parser', () => {
        test('timezone confusion depending on time part being present', () => {
            const chronoDef = new Chrono()
            expect(chronoDef.parseDate("2024-01-01T12:00")).toEqual(chronoDef.parseDate("01/01/2024 12:00"))

        })
        test('default timezone for timestamp in ISO format is not the same as short date format', () => {
            const chronoDef = new Chrono()
            expect(chronoDef.parseDate("2024-01-01T12:00")).toEqual(chronoDef.parseDate("01/01/2024 12:00"))
        })
        test('default timezone for date in ISO format as date&time wihtout zone indicator', () => {
            const chronoDef = new Chrono()
            expect(chronoDef.parseDate("2024-01-01")).toEqual(chronoDef.parseDate("2024-01-01T12:00"))
        })
        
        test('default timezone for timestamp in ISO format is not the same as short date format', () => {
            const chronoDef = new Chrono()
            expect(chronoDef.parseDate("2024-01-01T12:00")).toEqual(chronoDef.parseDate("01/01/2024 12:00"))

        })
        
        test("ISO dates should be parsed like local dates", () => {
            const chronoDef = new Chrono()
            const chronoDe = new Chrono(chrono.de.createCasualConfiguration(true))

            expect(chronoDef.parseDate("2024-01-01")).toEqual(chronoDef.parseDate("01/01/2024"))
            expect(chronoDef.parseDate("2024-01-01T12:00")).toEqual(chronoDef.parseDate("01/01/2024"))
        })
    })
    test('ISo dates are always parsed as UTC, never local ', () => {
        const localnewYear = new Date(2024,0,1); // not timezone info. Equal test
        // uses dayjs() bef
        expect(parseDate("2024-01-01T00:00")).toEqual(new Date(Date.UTC(2024,0,1)))
        expect(parseDate("2024-01-01T00:00")).not.toEqual(new Date(2024,0,1)) // this is local time
        expect(parseDate("2024-01-01")).toEqual(new Date(Date.UTC(2024,0,1,11)))
    })
    test('ISo dates have a 12pm default time (stil UTC) ', () => {
        expect(parseDate("2024-01-01")).toEqual(new Date(Date.UTC(2024,0,1,11)))
    })
    test('Partial ISO dates (year and month, or year only)', () => {
        const x = parseDate("2024")
        expect(parseDate("2024-01")).toBeNull()
        expect(parseDate("2024")).toBeNull()
    })
    test('ISo dates and time', () => {
        console.log(new Date(2024,0,1,12,1))
        console.log(parseDate("2024-01-01T12:01"))
        console.log(parseDate("2024-06-01T12:01"))
        expect(parseDate("2024-01-01T12:01Z")).toEqual(dayjs("2024-01-01T12:01Z"))
        expect(parseDate("2024-01-01T12:01")).toEqual(new Date(Date.UTC(2024,0,1, 12, 1)))
        expect(parseDate("2024-01-01T12:00:30")).toEqual(new Date(Date.UTC(2024,0,1, 12, 0,30)))
    })
    
})