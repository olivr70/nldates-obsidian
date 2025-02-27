import dayjs, { Dayjs } from "dayjs";
import { Chrono } from "chrono-node";

import { INLDParser } from "../types"
import { getLocalizedChrono } from "../utils/tools"
import { IsoPatchWeekDateTzdParser } from "./common/IsoPatchWeekDateTzdParser";
import { IsoPatchParser } from "./common/IsoPatchParser";
import { IsoEraDateParser } from "./common/IsoEraDateParser";
import { getIntlWeekStart } from "../utils/intl";
import { Z_FULL_FLUSH } from "zlib";

export abstract class NLDParserBase implements INLDParser {
    private _locale:string;
    private _chrono:Chrono;

    // @throws RangeError if locale is not valid
    constructor(locale:string) {
        this._locale =  locale; // Intl.getCanonicalLocales(locale)[0];
        this._chrono = this.configureChrono(getLocalizedChrono(locale.substring(0.2)))
    }

    get locale():string { return this._locale; }
    
    protected get chrono():Chrono { return this._chrono; }

    abstract moment(date:Date):Dayjs;
    
    getParsedDate(selectedText: string, referenceDate?:Date): Date {
        const myChrono = this.chrono;
        console.log("------------- getParsedDate() ------------- ")
        console.log(`NLDParserBase.parseDate ${selectedText}`)

        const initialParse = myChrono.parse(selectedText);

        const weekdayIsCertain = initialParse[0]?.start.isCertain("weekday");
        
        const locale = {
            weekStart: getIntlWeekStart(this.locale),
        };
        
        if (typeof referenceDate === "undefined") {
            // no reference date
            referenceDate = weekdayIsCertain
                ? dayjs().weekday(0).toDate()
                : new Date();
        }

        return myChrono.parseDate(selectedText, referenceDate );
    }

    /** @override */
    parseAll(fullText:string, referenceDate?:Date) {
        const candidates = this.chrono.parse(fullText, referenceDate)
        return candidates;
    }

    getFormattedDate(date:Date, format: string):string {
        return this.moment(date).format(format);
    }


    protected configureChrono(chrono:Chrono):Chrono {
        // add all standard ISO parsers
        chrono.parsers.push(new IsoPatchWeekDateTzdParser(), IsoPatchParser, IsoEraDateParser)
        return chrono;
    }
}