import { Dayjs } from "dayjs";
import { Chrono } from "chrono-node";

import { DayOfWeek, INLDParser } from "../types"
import { getLocalizedChrono } from "../utils/tools"
import { IsoPatchWeekDateTzdParser } from "./common/IsoPatchWeekDateTzdParser";
import { IsoPatchParser } from "./common/IsoPatchParser";
import { IsoEraDateParser } from "./common/IsoEraDateParser";

export abstract class NLDParserBase implements INLDParser {
    private _locale:string;
    private _chrono:Chrono;

    // @throws RangeError if locale is not valid
    constructor(locale:string) {
        this._locale =  locale; // Intl.getCanonicalLocales(locale)[0];
        this._chrono = this.configureChrono(getLocalizedChrono(locale.substring(0.2)))
    }

    get locale():string { return this._locale; }

    abstract moment(date:Date):Dayjs;
    abstract getParsedDate(selectedText: string, weekStartPreference: DayOfWeek): Date;
    abstract getFormattedDate(date:Date, format: string):string;

    protected get chrono():Chrono { return this._chrono; }

    protected configureChrono(chrono:Chrono):Chrono {
        // add all standard ISO parsers
        chrono.parsers.push(IsoPatchWeekDateTzdParser, IsoPatchParser, IsoEraDateParser)
        return chrono;
    }
}