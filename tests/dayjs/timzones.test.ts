
import dayjs from "dayjs"
import "../date-equality"

async function loadDayJs(withTz = false) {
    const dayjs = await import("dayjs");
    if (withTz) {
        const utc = (await import("dayjs/plugin/utc")).default;
        const timezone = (await import("dayjs/plugin/timezone")).default;
        dayjs.extend(utc);
        dayjs.extend(timezone);
    }
    return dayjs;
}

/** the 18 november of 2020 at 11:55 */
const REF = "2020-11-18T11:55:00";

const LOCAL_ISO = "YYYY-MM-DDThh:mm:ssZ"

describe("dayjs and TZ", () => {
    let myDayJs:Awaited<ReturnType<typeof loadDayJs>>;
    let djs:typeof dayjs;


    describe("without timezone plugin", () => {
        
        beforeEach(async () => {
            myDayJs = await loadDayJs();
            djs = myDayJs.default;
        })
        test("ISO date", () => {
            let refDate = djs(REF)
            console.log(`As iso ${refDate.toISOString()}`)
        })
    })
    
    describe("dayjs with timezone", () => {
        let currentTz = "";
        
        beforeEach(async () => {
            myDayJs = await loadDayJs(true);
            djs = myDayJs.default;
            currentTz = djs.tz.guess();
        })

        test("tz(, keeplocal=false) does not change UTC time", () => {
            // keepLocal false does not change absolute time position. It only alters display
            expect(dayjs(REF).tz("America/Toronto", false).toISOString()).toEqual(dayjs(REF).toISOString())
            // keepLocal true does not alter the HOUR and MINUTES composnent. This changes the absolute time position.
            expect(dayjs(REF).tz("America/Toronto").toISOString()).toEqual(dayjs(REF).toISOString())
            expect(dayjs(REF).tz("America/Toronto").toISOString()).toEqual(dayjs(REF).tz("Europe/Paris").toISOString())
        })
        test("tz(, keeplocal=true) modifies UTC time", () => {
            // keepLocal true does not alter the HOUR and MINUTES composnent. This changes the absolute time position.
            expect(dayjs(REF).tz("America/Toronto", true).toISOString()).not.toEqual(dayjs(REF).toISOString())

        })

        test("dayjs() uses current timezone", () => {
            expect(dayjs(REF).toISOString()).toEqual(dayjs.tz(REF, currentTz).toISOString())
        })
        
        test("dayjs.tz() with explicit timezones references different UTC times", () => {
            const dateInToronto = djs.tz(REF, "America/Toronto")
            const dateInParis = djs.tz(REF, "Europe/Paris")
            const dateInLondon = djs.tz(REF, "Europe/London")
            const dateInAthens = djs.tz(REF, "Europe/Athens")
            const dateUTC = djs.utc(REF)
            expect(dateInParis).not.toEqual(dateInLondon)
            expect(dateInParis).not.toEqual(dateInToronto)
            expect(dateInParis).not.toEqual(dateInAthens)
            // format use the timezone. hours ans minutes are the same, not the timezone offset
            expect(dateInParis.format("hh:mm")).toEqual(dateInAthens.format("hh:mm"))
            expect(dateInParis.format("Z")).not.toEqual(dateInAthens.format("Z"))
            expect(dateInToronto).not.toEqual(dateInParis);
        })
    })
})