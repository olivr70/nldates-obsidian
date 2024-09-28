import * as chrono from "chrono-node";
import { Chrono } from "chrono-node";

import "../date-equality"

describe('Chrono-node and timezones', () => {
    describe('in components', () => {
        test("should accept a timezone", () => {
            // BRT : Brasilia Time UTC-3 (Rio)
            // ECT : Ecuador Time UTC-5 (Quito)/
            // Beware  : when parsing ISO dates, timezone is ignored
            const noonInRio = chrono.parse("18/6/2024", { instant: new Date(), timezone: "BRT"})
            const noonInQuito = chrono.parse("18/6/2024", { instant: new Date(), timezone: "ECT"})
            const strRio = noonInRio[0].date();
            const strQuito = noonInQuito[0].date();
            expect(noonInQuito[0].start.date()).not.toEqual(noonInRio[0].start.date());
        })
    })
})