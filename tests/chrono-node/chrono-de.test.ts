import * as chrono from "chrono-node";
import { Chrono } from "chrono-node";

import "../date-equality"
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday"
import objectSupport from "dayjs/plugin/objectSupport"

dayjs.extend(weekday);
dayjs.extend(objectSupport);


describe('chrono-de ', () => {
    let C:Chrono;
    let ref:Dayjs;
    let refDate:Date = new Date(2024,5,17,12,0); // a monday;
    let refTime:number;
    // let parse = (str:string) => C.parse(str, ref.toDate())[0]?.date()
    let parseDate = (str:string) => C.parseDate(str, refDate)
    let parse = (str:string):chrono.ParsedResult[] => C.parse(str, refDate)
    beforeAll(() => {
        C = new Chrono(chrono.de.createCasualConfiguration(true));
        // ref date is June 17th 2024 at 12:00
        ref = dayjs(refDate);
      });
    describe.skip("some unsupported Chrono cases", () => {
        test("using ordinal numbers", () => {
            expect(parseDate("Der zehnte Dezember 2025")).toEqual(new Date(2025,11, 10))
        })
    })
    describe('DETimeUnitAgoFormatParser should parse', () => {
        describe('relations', () => {
                
            test('vor N', () => {
                expect(parseDate("vor 2 minuten")).toEqual(ref.subtract(120,"s"))
            })
            test('in N', () => {
                expect(parseDate("in 2 minuten")).toEqual(ref.add(120,"s"))
            })
            test('nächste N', () => {
                expect(parseDate("nächste 2 minuten")).toEqual(ref.add(120,"s"))
            })
            test('kommende N', () => {
                expect(parseDate("kommende 2 minuten")).toEqual(ref.add(120,"s"))
            })
            test('letzte N', () => {
                expect(parseDate("letzte 2 minuten")).toEqual(ref.subtract(120,"s"))
            })
            test('folgende N', () => {
                expect(parseDate("folgende 2 minuten")).toEqual(ref.add(120,"s"))
            })
            test('vergangene N', () => {
                expect(parseDate("vergangene 2 minuten")).toEqual(ref.subtract(120,"s"))
            })
            test('vorige N', () => {
                expect(parseDate("vorige 2 minuten")).toEqual(ref.subtract(120,"s"))
            })
            test('vorhergegangene N', () => {
                expect(parseDate("vorhergegangene 2 minuten")).toEqual(ref.subtract(120,"s"))
            })
            test('vorangegangene N', () => {
                expect(parseDate("vorangegangene 2 minuten")).toEqual(ref.subtract(120,"s"))
            })
        })
        describe('should parse units', () => {
            // quartalen|sekunden|quartals|quartale|sekunde|minuten|stunden|monaten|quartal
            //|minute|stunde|wochen|monate|monats|jahren|jahres|tagen|woche|monat|jahre|tage|jahr|sek|min|std|tag|jr|h|a|j
        
            test('years', () => {
                expect(parseDate("in 2 jahren")).toEqual(ref.add(2, "y"))
                expect(parseDate("in 2 jahres")).toEqual(ref.add(2, "y"))
                expect(parseDate("in 2 jahre")).toEqual(ref.add(2, "y"))
                expect(parseDate("in 2 jahr")).toEqual(ref.add(2, "y"))
                expect(parseDate("in 2 jr")).toEqual(ref.add(2, "y"))
            })
            test('quarters', () => {
                expect(parseDate("in 1 quartalen")).toEqual(ref.add(3, "month" ))
                expect(parseDate("in 1 quartale")).toEqual(ref.add(3, "month" ))
            })
        })
    })
    describe('DECasualDateParser should parse', () => {
        // jetzt|heute|morgen|übermorgen|uebermorgen|gestern|vorgestern|letzte\s*nacht)(?:\s*(morgen|vormittag|mittags?|nachmittag|abend|nacht|mitternacht)
        test('relative day names', () => {
    
            expect(parseDate("jetzt")).toEqual(ref)
            expect(parseDate("heute")).toEqual(ref)
            expect(parseDate("morgen")).toEqual(ref.add(1, "d"))
            expect(parseDate("übermorgen")).toEqual(ref.add(2, "d"))
            expect(parseDate("uebermorgen")).toEqual(ref.add(2, "d"))
            expect(parseDate("gestern")).toEqual(ref.subtract(1, "d"))
            expect(parseDate("vorgestern")).toEqual(ref.subtract(2, "d"))
        })

        test('relative days with period names', () => {
            expect(parseDate("gestern morgen")).toEqual(ref.subtract(1, "d").hour(6))
            expect(parseDate("gestern Morgen")).toEqual(ref.subtract(1, "d").hour(6))
            expect(parseDate("gestern vormittag")).toEqual(ref.subtract(1, "d").hour(9))
            expect(parseDate("gestern Vormittag")).toEqual(ref.subtract(1, "d").hour(9))
            expect(parseDate("gestern mittags")).toEqual(ref.subtract(1, "d").hour(12))
            expect(parseDate("gestern nachmittag")).toEqual(ref.subtract(1, "d").hour(15))
            expect(parseDate("gestern Nachmittag")).toEqual(ref.subtract(1, "d").hour(15))
            expect(parseDate("gestern abend")).toEqual(ref.subtract(1, "d").hour(18))
            expect(parseDate("gestern Abend")).toEqual(ref.subtract(1, "d").hour(18))
            expect(parseDate("gestern nacht")).toEqual(ref.subtract(1, "d").hour(22))
            expect(parseDate("gestern Nacht")).toEqual(ref.subtract(1, "d").hour(22))
        
        })
        
    })
    describe('SlashDateFormatParser', () => {
        test('', () => {
    
        })
        
    })
    describe('DETimeExpressionParser', () => {
        test('', () => {
    
        })
        
    })
    describe('DESpecificTimeExpressionParser', () => {
        test('', () => {
    
        })
        
    })
    describe('DEMonthNameLittleEndianParser', () => {
        test('', () => {
    
        })
        
    })
    describe('DEWeekdayParser should parse', () => {
// (?:a[mn]\s*?)?
// (?:(diese[mn]|letzte[mn]|n(?:ä|ae)chste[mn])\s*)?
// ((?:donnerstag|dienstag|mittwoch|sonntag|freitag|samstag|montag|so|mo|di|mi|do|fr|sa))
// (diese|letzte|n(?:ä|ae)chste)\s*woche)?(?=\W|$)/i
        test('weekdays', () => {
            console.log(ref);
            console.log(ref.add(1,"w"));
            console.log(ref.subtract(1,"w"));
            console.log(ref.subtract(1,"w").add(1,"d"));
            console.log("Jour référence " + ref.day())
            console.log("Jour référence " + ref.weekday())
            expect(parseDate("diesen montag")).toEqual(ref);
            expect(parseDate("diesen dienstag")).toEqual(ref.add(1,"d"));
            expect(parseDate("diesen mittwoch")).toEqual(ref.add(2,"d"));
            expect(parseDate("diesen donnerstag")).toEqual(ref.add(3,"d"));
            expect(parseDate("diesen freitag")).toEqual(ref.add(4,"d"));
            expect(parseDate("diesen samstag")).toEqual(ref.add(5,"d"));
            expect(parseDate("diesen sonntag")).toEqual(ref.add(6,"d"));
            // "nächsten x" is ambiguous if the current day is before the target day
            // in the current week. Chrono interprets its the american way, meaning
            // X next week
            expect(parseDate("nächsten mittwoch")).toEqual(ref.add(1, "w").add(2,"d"));
            expect(parseDate("letzten dienstag")).toEqual(ref.subtract(1,"w").add(1,"d"));
        });
        test('short weekdays', () => {
            expect(parseDate("diesen mo")).toEqual(ref.weekday(1));
            expect(parseDate("letzten di")).toEqual(ref.subtract(7,"d").weekday(2));
            expect(parseDate("nächsten mi")).toEqual(ref.add(7, "d").weekday(3));
        });

        test('weeks', () => {
            expect(parseDate("Dienstag diese woche")).toEqual(ref.add(1,"d"));
            expect(parseDate("Dienstag letzte woche")).toEqual(ref.subtract(1,"w").add(1,"d"));
            expect(parseDate("Dienstag nächste woche")).toEqual(ref.add(1,"w").add(1,"d"));
        });
        
    })
    describe('DETimeUnitWithinFormatParser should parse', () => {
        // (?:in|für|während)\\s*
        // ((?:(?:(?:sieben|zwoelf|einem|einen|einer|fuenf|sechs|zwölf|eins|eine|zwei|drei|vier|fünf|acht|neun|zehn|elf)|[0-9]+|[0-9]+\\.[0-9]+|halb?|halbe?|einigen?|wenigen?|mehreren?))
        // \\s{0,5}(?:(?:quartalen|sekunden|quartals|quartale|sekunde|minuten|stunden|monaten|quartal|minute|stunde|wochen|monate|monats|jahren|jahres|tagen|woche|monat|jahre|tage|jahr|sek|min|std|tag|jr|h|a|j))\\s{0,5}(?:\\s{0,5},?\\s{0,5}(?:(?:(?:sieben|zwoelf|einem|einen|einer|fuenf|sechs|zwölf|eins|eine|zwei|drei|vier|fünf|acht|neun|zehn|elf)|[0-9]+|[0-9]+\\.[0-9]+|halb?|halbe?|einigen?|wenigen?|mehreren?))\\s{0,5}(?:(?:quartalen|sekunden|quartals|quartale|sekunde|minuten|stunden|monaten|quartal|minute|stunde|wochen|monate|monats|jahren|jahres|tagen|woche|monat|jahre|tage|jahr|sek|min|std|tag|jr|h|a|j))\\s{0,5}){0,10})(?=\\W|$)"

        test('with numbers', () => {
            expect(parseDate("in 2 tagen")).toEqual(ref.add(2, "d"))
            expect(parseDate("für 2 tagen")).toEqual(ref.add(2, "d"))
            expect(parseDate("während 2 tagen")).toEqual(ref.add(2, "d"))
        })
        
        test('number names', () => {
            expect(parseDate("in zwei tagen")).toEqual(ref.add(2, "d"))
            expect(parseDate("in vier tagen")).toEqual(ref.add(4, "d"))
        })
        
        test('different units', () => {
            expect(parseDate("in 2 sekunde")).toEqual(ref.add(2, "s"))
            expect(parseDate("in 2 minuten")).toEqual(ref.add(2, "minutes"))
            expect(parseDate("in 2 stunde")).toEqual(ref.add(2, "h"))
            expect(parseDate("in 2 tagen")).toEqual(ref.add(2, "d"))
            expect(parseDate("in 2 wochen")).toEqual(ref.add(2, "w"))
            expect(parseDate("in 2 monaten")).toEqual(ref.add(2, "month"))
            expect(parseDate("in 1 quartalen")).toEqual(ref.add(3, "month"))
        })
        
    })
})