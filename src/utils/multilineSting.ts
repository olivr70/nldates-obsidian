

export const EOT= "\u0004"
export const LF = "\u000A"
export const CR = "\u000D"
export const EOT_CP = 4
export const LF_CP = 10
export const CR_CP = 13


//#region Position
export interface Position {
    line:number;
    ch:number;
}

export const NaNPosition:Position = { line:NaN, ch:NaN }

export function isPosition(some:any): some is Position {
    return typeof some == "object" && typeof some.line == "number" && typeof some.ch == "number"
}

/** if line is defined, ch defaults to 0 
 * @returns false if val or ref is undefined, or val.line or ref.line is undefined
*/
export function posEq(val:Partial<Position>, ref:Partial<Position>) {
    return val?.line == ref?.line && (val?.ch ?? 0) == (ref?.ch ?? 0)
}
/** if line is defined, ch defaults to 0
 * @returns false if val or ref is undefined, or val.line or ref.line is undefined
*/
export function posLt(val:Partial<Position>, ref:Partial<Position>) {
    return val?.line < ref?.line || (val?.line == ref?.line && (val?.ch ?? 0) < (ref?.ch ?? 0))
}
/** if line is defined, ch defaults to 0
 * @returns false if val or ref is undefined, or val.line or ref.line is undefined
*/
export function posLte(val:Partial<Position>, ref:Partial<Position>) {
    return val?.line < ref?.line || (val?.line == ref?.line && (val?.ch ?? 0) <= (ref?.ch ?? 0))
}
/** if line is defined, ch defaults to 0
 * @returns false if val or ref is undefined, or val.line or ref.line is undefined
*/
export function posGt(val:Partial<Position>, ref:Partial<Position>) {
    return val?.line > ref?.line || (val?.line == ref?.line && (val?.ch ?? 0) > (ref?.ch ?? 0))
}
/** if line is defined, ch defaults to 0
 * @returns false if val or ref is undefined, or val.line or ref.line is undefined
*/
export function posGte(val:Position, ref:Position) {
    return val?.line > ref?.line || (val?.line == ref?.line && (val?.ch ?? 0) >= (ref?.ch ?? 0))
}

//#region Range
export interface Range {
    start: Position;
    end: Position;

}

export function isRange(some:any):some is Range {
    return isPosition(some?.start)
        && isPosition(some?.end)
}
export function range(startLine:number, startCh:number, endLine:number, endCh:number) {
    return { start: { line:startLine, ch:startCh}, end: { line:endLine, ch:endCh}}
}

/** true if *pos* in inside *token* 
 * @returns false, if token is undefined or if partial token has no end or no start
*/
export function posInRange(pos: Position, token:Partial<Range> ):boolean {
    return posLt(token?.start,pos) && posLt(pos,token?.end)
}

/** true is *arg* ends before *ref* start */
export function rangeIsBefore(arg:Range, ref:Partial<Range>) {
    return posLte(arg.end, ref?.start)
}
/** true is *arg* starts after *ref* end */
export function rangeIsAfter(arg:Range, ref:Partial<Range>) {
    return posGte(arg.start, ref?.end)
}
/** true is *arg* starts after ref.start, and ends before ref.end 
 * if line is set, *ch* defaults to 0
*/
export function rangeContains(arg:Range, ref:Partial<Range>) {
    return posLte(arg.start, ref?.start)
    && posLte(arg.end, ref?.end)
}

export function rangeOverlaps(arg:Range, ref:Partial<Range>) {
    // return !(rangeIsBefore(arg,ref) || rangeIsAfter(arg,ref))
    // return !(posLte(arg.end, ref?.start) || posGte(arg.start, ref?.end))
    // return !posLte(arg.end, ref?.start) && !posGte(arg.start, ref?.end)
    return posGt(arg.end, ref?.start) && posLt(arg.start, ref?.end)
}

//#region MultilineString
/** mimicks a cotinuous flow of characters from an array of lines
 * when iterating over characters, a LF characters is inserted af the
 * end of each line, except for the last one
 * This is necessary for parsing
 * It also allows the virtual string to be of the same length
 * Like a string, the iterator is on codepoints
 * 
 * All positions are expressed relative to the underlying lines
 * *start* and *end* only limit iterations
 */
export class MultilineString implements Range, Iterable<number> {
    lines:string[]
    start:Position
    end:Position
    constructor(
        lines:string[] | string
        , start:Position = { line:0, ch:0 }
        , end:Position = { line:lines.length - 1, ch:lines[lines.length - 1].length }
    ) {
        if (typeof lines == "string")
            lines = lines.split(/\n/)
        this.lines = lines; 
        this.start = this.normalize(start, lines);
        this.end = this.normalize(end, lines)
        if (posLt(this.end, this.start)) this.end = this.start // will be empty
    }

    /** true is Position is before the start of the string
     * if pos.line is defined, ch defaults to 0
     */
    bos(pos:Position) { return !posLte(this.start, pos) }
    /** true is Position is equal or beyond the end of string
     * if pos.line is defined, ch defaults to 0
     */
    eos(pos:Position) { return posLte(this.end, pos) }

    [Symbol.iterator]():Iterator<number> {
        let current:Position = this.start
        return {
            next: () => {
                if (posLt(current, this.end)) {
                    const value = this.codePointAt(current)
                    current = this.next(current)
                    return { value, done:false }
                } else {
                    return { value:undefined, done:true}
                }
            }
        }
    }

    /** returns a valid position in the lines
     * WANRING: it does not take into account this.start and this.end
     */
    normalize(pos:Position, lines:string[] = this.lines) {
        let line = pos?.line ?? 0
        let ch = pos?.ch ?? 0
        // normalize line
        if (line < 0) { return { line:0, ch:0} }
        else if (line >= this.lines.length) { 
            // beyond last line, return end of last line
            return { line:lines.length, ch:0  }
        }
        // normalize ch
        const len = lines[line].length + 1
        if (ch < 0) { ch = 0 }  // relative to end of line
        else if (ch > len) { ch = len }
        return { line, ch }
    }
    /** returns the virtual length of line *index*, with the extra LF (except for last line)
     * @returns NaN if out of bounds (coherence with text being undefined)
    */
    lineLength(lineIndex:number):number {
        let result = this.lines[lineIndex]?.length
        if (result == undefined) return NaN
        if (lineIndex != this.lines.length - 1) {result++}
        return result
    }

    /** return the text of the line, including the extra LF
     * @returns undefined if index is out of bounds
     */
    line(index:number):string {
        let res =  this.lines[index]
        if (res != undefined && index != this.lines.length - 1) {
            res += "\n"
        }
        return res;
    }

    /** @returns EOT if line is beyon \n is ch is length, empty string beyond */
    charAt(pos:Position):string {
        const line = this.lines[pos.line]
        if (line == undefined) return EOT;
        if (pos.ch < line.length) return line.charAt(pos.ch) 
        if (pos.line == this.lines.length - 1) return EOT
        return LF
    }
    charIn(pos:Position, offset:number):string {
        return this.charAt(this.offset(pos, offset))
    }
    codePointAt(pos:Position):number {
        const line = this.lines[pos.line]
        if (line == undefined) return EOT_CP;
        if (pos.ch < line.length) return line.codePointAt(pos.ch) 
        if (pos.line == this.lines.length - 1) return EOT_CP
        return LF_CP
    }
    codePointIn(pos:Position, offset:number):number {
        return this.codePointAt(this.offset(pos, offset))
    }
    substring(start:Position = this.start, end:Position = this.end):string {
        if (end.line < start.line) { return "" }
        start = this.normalize(start, this.lines)
        end = this.normalize(end, this.lines)
        if (start.line == end.line) {
            return this.line(start.line)?.substring(start.ch, end.ch)
        }
        const parts:string[] = [ this.lines[start.line].substring(start.ch) ]
        for (let l = start.line + 1; l < end.line; l++) { 
            parts.push(this.lines[l])
        }
        parts.push(this.lines[end.line]?.substring(0, end.ch))
        return parts.join("\n");

    }
    /** returns a new MultilineString, between *start* and *end* */
    subpart(start:Position = this.start, end:Position = this.end) {
        return new MultilineString(this.lines, start, end)
    }
    
    /** return next position
     * If pos is beyond the end, the result is incremented as if there were an inifnity 
     * of lines (if looping, caller should test the result using {@link eosAt})
     * @returns this.start if pos  === undefined
     */
    next(pos:Position):Position {
        if (pos?.line === undefined) return this.start
        const len = this.lines[pos.line]?.length ?? 0
        const ch = pos.ch ?? 0
        if (ch >= len) { // >= because of the extra \n
            return { line:pos.line + 1, ch:0 }
        } else { 
            return { line:pos.line, ch:ch + 1 }
        }
    }
    
    offset(pos:Position, count:number):Position {
        while (count-- != 0) {
            pos = this.next(pos)
        }
        return pos;
    }

    /** return the end of line *pos.line* from pos.ch 
     * Does not include the final LF
     *@returns undefined if line is out of bounds
    */
    lineEnd(pos:Position) {
        return this.line(pos.line)?.substring(pos.ch ?? 0)
    }

}

export function stringToTextStream(text:string) {
    const lines = text.split(/\n/)
    return new MultilineString( lines, { line:0, ch:0}, { line:lines.length - 1, ch:lines[lines.length - 1].length});
}
