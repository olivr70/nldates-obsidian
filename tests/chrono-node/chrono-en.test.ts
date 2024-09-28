import * as chrono from "chrono-node";
import { Chrono } from "chrono-node";

import "../date-equality"
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday"


describe('chrono-en', () => {
    let C:Chrono;
    let ref:Dayjs;
    let refDate:Date;
    let refTime:number;
    let parse = (str:string) => C.parse(str, ref.toDate())[0].date()
    beforeAll(() => {
        C = chrono.en.casual.clone();
        // ref date is June 15th 2024 at 12:00
        refDate = new Date(2024,5,17,12,0); // a monday
        ref = dayjs(refDate);
      });

    describe('weekdays', () => {
        test('last', () => {
            expect(parse("last monday")).toEqual(ref.subtract(7,"d"));
            expect(parse("last tuesday")).toEqual(ref.subtract(6,"d"));
        })
        test('this', () => {
            expect(parse("this monday")).toEqual(ref);
            expect(parse("this tuesday")).toEqual(ref.add(1,"d"));
            expect(parse("this sunday")).toEqual(ref.add(6,"d"));
        })
        test('next', () => {
            // typically mean the Tuesday of the following week, not the immediate Tuesday.
            expect(parse("next monday")).toEqual(ref.add(7,"d"));
            expect(parse("next tuesday")).toEqual(ref.add(8,"d"));
        })
    })
})