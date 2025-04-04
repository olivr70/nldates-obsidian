
import { Pos } from "obsidian";
import { isEditorPosition } from "./osbidian";
import { alt, named, seq, zeroOrMore } from "./regex"; 
import { isHighSurrogate } from "./unicode";
import { AssertionError } from "assert";
import { EOT, isPosition, posLt, posLte, MultilineString, NaNPosition, Position, posEq, posGte, posGt, Range, isRange, posInRange, rangeOverlaps } from "./multilineSting";


export function linesToText(lines:string[], start:number = 0, end:number = lines.length) {
    return lines.slice(start, end).join("\n")
}


const punctuationCharacters: string[] = [
    "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
    ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"
  ];

const VALID_ESCAPE = /^[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/

export interface Mdlink {
    label:string
    url:string 
    title?:string
}

export interface MdWikilink {
    page:string
    alias?:string
}



export type TokenValue = object | string | number | Date
export type ValueFunc = (text:string, children:Token[]) => TokenValue


export interface TokenInfo extends Range {
    type:string
    text?: string;
    value?: TokenValue | ValueFunc
    children?: Token[]
}

export interface Token extends Range {
    type:string
    text?: string;
    value?: TokenValue
    children?: Token[]
}

export function isToken(some:any):some is Token {
    return typeof some.type == "string"
        && (some.text == undefined || typeof some.text == "string")
        && (some.children == undefined || Array.isArray(some.children))
        && isRange(some)
}

export function asToken(some:any):Token {
    return isToken(some) ? some : undefined
}


/** return all children of type */
function getChildren(token:Partial<Token>, type:string) {
    return token.children?.filter((t) => t.type == type)
}

/** return the first child of type
 * 
 * TODO : optimize
 */
function getChild(token:Partial<Token>, type:string) {
    return getChildren(token, type)?.[0]
}

/** returns the first token of type, in shallow first search
 * 
 * Note : fromToken is not examined
*/
export function getDescendant(fromToken:Partial<Token>, type:string):Token {
    if (fromToken?.children) {
        for (let c of fromToken.children) {
            if (c.type == type) return c;
        }
        for (let c of fromToken.children) {
            const d = getDescendant(c, type)
            if (d) { return d }
        }
    }
    return undefined
}

export function getAll(fromToken:Partial<Token>, types:string[]):Record<string, Token> {
    let result:Record<string, Token> = {}
    getAllInner(fromToken, types, result)
    return result
}

/** fills a 
*/
function getAllInner(token:Partial<Token>, types:string[], ioRecord:Record<string, Token>) {
    for (let c of token.children) {
        if (types.indexOf(c.type) != -1 && !ioRecord.hasOwnProperty(c.type)) {
            ioRecord[c.type] = c
        }
    }
    // now let's explore sublevel
    for (let c of token.children) {
        getAllInner(c, types, ioRecord)
    }

}

/** return child at position (there can be only one) */
function getChildAtPos(token:Partial<Token>, pos:Position ) {
    if (!token?.children) return undefined;
    for (const c of token?.children) {
        if (posInRange(pos, c)) { return c; }
    }
    return undefined
}

export function deepestTokenAt(token:Token, pos:Position) {
    return innerDeepestTokenAt(token, pos)
}

function innerDeepestTokenAt(token:Token, pos:Position):Token {
    if (token.children) {
        for (let child of token.children) {
            if (posInRange(pos, child)) {
                return innerDeepestTokenAt(child, pos) ?? child
            }
        }
    }
    return undefined;
}

export function tokensAt(token:Token, pos:Position) {
    return innerTokensAt(token, pos, [])
}

function innerTokensAt(token:Token, pos:Position, ioResult:Token[]) {
    if (token.children) {
        for (let child of token.children) {
            if (posInRange(pos, child)) {
                ioResult.push(child)
                innerTokensAt(child, pos, ioResult)
                break;
            }
        }
    }
    return ioResult;
}
/** returns the widest t */
export function getTokenOfType(root:Partial<Token>, pos:Position, type:string):Partial<Token> {
    if (posInRange(pos, root)) {
        if (root.type == type) return root
        const c = getChildAtPos(root, pos)
        if (c) {
            return getTokenOfType(c, pos, type)
        }
    }
}

export function isInType(root:Partial<Token>, pos:Position, type:string) {
    return getTokenOfType(root, pos, type) != undefined
}

/** check if root or any of its children is of type *type* and overlaps range
 * Usually used to check if selection overlaps a specific construct, like a "link"
 */
export function rangeOverlapsType(root:Partial<Token>, range:Range, type:string) {
    if (rangeOverlaps(range, root)) {
        if (root.type == type) return true;
        for (let c of root.children) {
            if (posGt(c.start, range.end)) break;   // children beyond will not overlap
            const result = rangeOverlapsType(c, range, type)
            if (result) return true;

        }
    }
    return false;
}

function getValue(token:Partial<Token>, ...names:string[]) {
    let t = token;
    let target:Token = undefined;
    for (let n of names) {
        target = getChild(t, n)
        if (target == undefined)
            return null;

    }
   return target?.value ?? target?.text
}

function getEndOfLastChild(token:Partial<Token>):Position {
    return token?.children?.[token?.children?.length - 1]?.end ?? NaNPosition
}

function findSubtoken(token:Partial<Token>, filter:(tok:Partial<Token>) => boolean):Partial<Token> {
    if (filter(token)) return token
    if (token.children) {
        for (let c of token.children) {
            let res = findSubtoken(c,filter)
            if (res != undefined) {
                return res;
            }
        }
    }
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//#region State
/** all information about the current token we are trying to build
 * Created on begin(), discarded on rollback() or merged on commit()
 */
class State {

    constructor(text:MultilineString, pos:Position, type:string, valueFunc?:ValueFunc) {

        this.start = pos
        // we need our own copy of pos, as it will be incremented
        this.pos = {line:pos.line, ch:pos.ch }
        this.token = { type, start:pos, children:[], text:text.substring()}
        this.valueFunc = valueFunc
    }
    get lastChild():Token | undefined { 
        return this.token.children[this.token.children.length - 1] 
    }
    /** the end of last child, or start of this state */
    get lastMark():Position {
        return this.lastChild?.end ?? this.start
    }
    get pos() { return this._pos }
    set pos(val:Position) { this._pos = {line:val.line, ch:val.ch} }

    finalize() {
        this.token.end = getEndOfLastChild(this.token)

    }

    private _pos:Position;
    start:Position;
    token:Partial<Token>;
    valueFunc?:ValueFunc
}
//#endregion

//#region Head

/** the current position in the text we are parsing
 * 
 * Allows backtracking using begin(),commit(),rollback()
 */
export class Head implements Range {
    text:MultilineString;
    states:State[] = [];

    constructor(text:MultilineString) {
        this.text = text;
        this.states.push(new State(text, this.start, "root"))
    }

    get state() { return this.states[this.states.length - 1] }
    get lastMark() { return this.state.lastMark }
    get pos() { return this.state.pos }
    get start() { return this.text.start; }
    get end() { return this.text.end; }
    set pos(newPos:Position) { this.state.pos = newPos }
    get inProgress():Partial<Token> { return this.state.token }
    get root():Partial<Token> { return this.states[0].token }

    posInc():Position { const current = this.pos; this.pos = this.text.next(this.pos); return current; }

    // absolute access
    eosAt(index:Position) { return posLte(this.end, index) }
    peekCharAt(index:Position) { return this.eosAt(index) ? EOT : this.text.charAt(index)}
    
    peekAt(index:Position):[string,number] { 
        if (this.eosAt(index)) return [EOT,0];
        const c= this.peekCharAt(index)
        if (c == '\\') {
            const n = this.peekCharAt(this.text.offset(index, 1));
            if (VALID_ESCAPE.test(n)) {
                return [n,2]
            } else {
                return ['\\', 1]
            }
        } else if (isHighSurrogate(c)) {
            return [ String.fromCodePoint(this.text.codePointAt(index)), 2]
        } else {
            return [c, 1]
        }
    }

    // relative access (to current pos)
    eos() { return posLte(this.end, this.pos) }
    eosIn(offset:number) { return posLte(this.end, this.text.offset(this.pos,offset)) }
    peekChar() { return this.peekCharAt(this.pos) }
    peekCharIn(offset:number) { return this.peekCharAt(this.text.offset(this.pos, offset)) }
    nextChar() { return this.eos() ? EOT : this.text.charAt(this.posInc())}
    remaining() { return this.text.substring(this.pos, this.end)}
    /** match a character */
    matchChar(ch:string) {
        if (this.peekChar() == ch) { this.posInc(); return true; }
        return false
    }

    skipText(target:string | RegExp, pushPreviousText = false) {
        if (typeof target == "string") { return this.skipString(target, pushPreviousText)} 
        else { return this.matchReg(target, undefined , undefined, pushPreviousText)}
    }

    /** if target is at current pos, move position at its end */
    skipString(target:string, pushPreviousText = true) {
        if (this.text.lineEnd(this.pos).startsWith(target)) {
            if (pushPreviousText) {
                this.pushText(this.lastMark, this.pos)
            }
            this.pos.ch += target.length
            return true
        }
        return false
    }
    peek(offset = 0):[string,number] { 
        if (this.eosIn(offset)) return [EOT,0];
        const c= this.peekCharIn(offset)
        if (c == '\\') {
            const n = this.peekCharIn(offset + 1);
            if (VALID_ESCAPE.test(n)) {
                return [n,2]
            } else {
                return ['\\', 1]
            }
        } else if (isHighSurrogate(c) && !this.eosIn(1)) {
            return [ String.fromCodePoint(this.text.codePointIn(this.pos, offset)), 2]
        } else {
            return [c, 1]
        }
    }
    nextCodepoint() {
        const [v,l] = this.peek()
        this.pos = this.text.offset(this.pos, l);
        return v;
    }
    codepointIn(count:number) {
        let i = 0
        let offset = 0
        while (!this.eosIn(offset)) {
            const [v,w] = this.peek(offset)
            if (i++ == count) { return v}
            offset += w
        }
        return EOT;
    }
    skip(codepointCount:number) {
        while (codepointCount > 0 && this.nextCodepoint() != EOT) {
            codepointCount--
        }
    }
    ignore(reg:RegExp) {
        while (!this.eos()) {
            const m = this.testReg(reg)
            if (m == undefined) {
                break;
            }
            this.skip(m[0].length)
            if (m[0].length == 0) {
                // 0 length match. This could loop infinetly
                break;
            }
        }
    }
    ignoreSpaces():Head {
        this.ignore(/^\s+/)
        return this;
    }
    /** push a new token. If there is some unconsumed texte before it, create a text Token */
    pushNewToken(info:TokenInfo, pushPreviousText = false) {
        if (pushPreviousText) {
            this.pushText(this.lastMark, info.start)
        }
        if (info.type == undefined) return
        const tokenText = info.text || this.text.substring(info.start, info.end)
        const value = info.value ?? (typeof info.value == "function" ? info.value(tokenText, info.children) as TokenValue : info.value)
        const newToken:Token = { type:info.type, start:info.start, end:info.end, text:tokenText, children:info.children, value}
        this.state.token.children.push( newToken )
    }

    /** add a new "text" token to the children of the current Token
     * 
     * NOTE : only if start is stricly before end
     */
    pushText(start:Position, end:Position) {
        if (!posLt(start, end)) return
        const newText:Token = { type:"text", start, end, text: this.text.substring(start, end) }
        this.state.token.children.push(newText)
    }

    begin(type?:string, value?:ValueFunc) { 
        this.states.push(new State(this.text, this.pos, type, value))
    }
    rollback():false { 
        if (this.states.length == 1) {
            throw new Error("Rollback not matching a previous begin()")
        }
        const last = this.states.pop(); 
        return false;
    }
    /** if value is passed, it is used even if valueFunc had been provided 
     * 
     * if 
    */
    commit(value?:any, pushPreviousText = false) { 
        if (this.states.length == 1) {
            throw new Error("Commit not matching a previous begin()")
        }
        const last = this.states.pop();
        if (last.pos == this.pos) {
            throw new Error("Commit wihtout consuming any character in source text")
        }
        if (last.token.type) {
            const start = last.token.start

            const end = last.pos
            const text = this.text.substring(start, end)
            // group all tokens in a parent token
            this.pushNewToken({ type:last.token.type, start, end, text, children:last.token.children, value: value ?? last.valueFunc}, pushPreviousText)
            this.pos = last.pos
        } else {
            // just append the new tokens
            this.state.token.children.push(...last.token.children)
        }
        this.state.finalize()
        return true;}

    testReg(reg:RegExp):RegExpExecArray {
        return reg.exec(this.remaining())
    }

    matchReg(reg:RegExp, type:string = undefined, makeValue?:ValueFunc, pushPreviousText = false):RegExpExecArray {
        const m = this.testReg(reg)
        if (m && m.index == 0) { 
            this.pushNewToken({type, start:this.pos, end: this.text.offset(this.pos, m[0].length),text: m[0], value:makeValue }, pushPreviousText); 
            this.pos = this.text.offset(this.pos, m[0].length)
            return m;
        }
        return undefined;
    }
    matchWhile(head:Head, whileFunc:(head:Head) => boolean, type:string, makeValue?:ValueFunc) {
        if (head.eos()) return false;
        const text:string[] = []
        const start = this.pos
        let matchCount = 0
        while (!head.eos() && whileFunc(head)) {
            text.push(head.nextCodepoint())
        }
        if (matchCount != 0) {
            const textValue = text.join('')
            const value = makeValue ?? makeValue(textValue, [])
            this.pushNewToken({type, start, end:this.pos, text:textValue, value:makeValue})
        }
    }
    matchUntil(untilReg:RegExp, type:string, makeValue?:ValueFunc) {
        if (this.eos()) return false;
        this.begin()
        const text = []
        const start = this.pos
        let count = 0
        while (!this.eos()) {
            const untilMatch = this.matchReg(untilReg)
            if (untilMatch) {
                this.pushNewToken({type, start, end:this.pos, text:text.join(''), value:makeValue})
                return this.commit();
            }
            text.push(this.nextCodepoint())
        }
        return this.rollback();
    }

}
//#endregion
//#region Stream
export class Stream {
    text:MultilineString
    heads:Head[] = []

    constructor(text:MultilineString | string[] | string) {

        const mlString =  text instanceof MultilineString ? text: new MultilineString(text)
        this.text = mlString
        this.heads[0] = new Head(mlString)
    }

    get top() { return this.heads[this.heads.length - 1]}

    /** open a Head between *start* and *end*
     * This head is now the current one, until {@link close} is invoked
     */
    open(start:Position, end:Position):Head {
        const newHead = new Head(this.text.subpart(start, end))
        this.heads.push(newHead)
        return newHead
    }
    /** close the current head. All found children are inserted as children
     * of the inProgress Token
     */
    close():Head {
        if (this.heads.length == 1) {
            throw new Error("closed head without first invoking open()")
        }
        const lastTop = this.heads.pop()
        // merge children to 
        this.top.inProgress.children.push(...lastTop.inProgress.children)
        return lastTop
    }
}
// #endregion

//#region matcher functions
export function matchBracketed(stream:Stream,type:string, open:RegExp | string, close?:RegExp | string):boolean {
    const head = stream.top
    head.begin(type)
    close = close ?? open
    if (head.skipText(open, true)) {
        const innerStreamStart= head.pos
        let innerStreamEnd = head.pos
        while (!head.eos()) {
            const innerText = head.text.substring(innerStreamStart, innerStreamEnd)
            if (head.skipText(close)) {
                // parse inline content inside
                try {
                    stream.open(innerStreamStart, innerStreamEnd )
                    matchInline(stream)
                } finally {
                    stream.close()
                }
                return head.commit(innerText, true)
            }
            head.skip(1);
            innerStreamEnd = head.text.next(innerStreamEnd) 
        }
    }
    return head.rollback()
}

function matchBold(stream:Stream) { return matchBracketed(stream, "bold", "__") ||  matchBracketed(stream, "bold", /\*\*/)}
function matchItalic(stream:Stream) { return matchBracketed(stream, "italic", /_(?!_)/) ||  matchBracketed(stream, "italic", /\*(?!\*)/)}
function matchHilite(stream:Stream) { return matchBracketed(stream, "hilite", "==")}
function matchStrike(stream:Stream) { return matchBracketed(stream, "barred", "~~")}

function matchInlineCode(stream:Stream) { return matchBracketed(stream, "code", "`") }

export function matchInline(stream:Stream) {
    const head = stream.top
    let part:string[] = []
    while (!head.eos()) {
        const matched = matchBold(stream) || matchItalic(stream) || matchHilite(stream) || matchStrike(stream) || matchInlineCode(stream)
        if (matched) {
        } else {
            part.push(head.nextCodepoint())
        }
    }
    if (posLt(head.lastMark, head.pos)) {
        head.pushText(head.lastMark, head.pos)
    }
    head.state.finalize()
    return true
}

export function matchWikilink(stream:Stream) {
    const head = stream.top
    head.begin('wikilink')
    if (head.matchReg(/\[\[/)) {
        const start  = head.pos
        let value:Partial<MdWikilink> = {}
        let part:string[] = []
        while (!head.eos()) {
            const ch = head.peekChar()  // not codepoint, 
            switch (ch) {
                case "|" : 
                    if (value.page) { 
                        // already in alias. | is treated like any character
                        part.push(ch) }
                    else { value.page = part.join('').trim(); part= []; }
                    head.skip(1)
                    break;
                case ']' : 
                    if (head.peekChar() == ']') {
                        head.skip(2)
                        if (value.page) {
                            value.alias = part.join('')
                        } else {
                            value.page = part.join('').trim()
                        }
                        return head.commit(value)
                        break;
                    } else {
                        // a single suare bracket does not end the wikilink
                        part.push(ch)
                        head.skip(1)
                    }

                    break;
                default:
                    part.push(head.nextCodepoint())
            }
        }
    }
    return head.rollback();
}

export function matchLink(stream:Stream) {
    const head = stream.top
    head.begin("link")
    if (matchLinkLabel(stream) && matchLinkTarget(stream)) {
        // we have a full link, get content
        const label = getValue(head.inProgress, "label")?.toString()
        const url = getValue(head.inProgress, "url")?.toString()
        const title = getValue(head.inProgress, "title")?.toString()
        const val:Mdlink = {
            label,url, ...( title && { title })}
        return head.commit(val)
    }
    return head.rollback();
}

/** match the [] part of a Markdown link */
function matchLinkLabel(stream:Stream) {
    const head = stream.top
    head.begin("label")
    if (head.skipString("[") && head.peekChar() != "[") {
        const labelStart = head.pos
        let part:string[] = []
        let nesting = 0;
        while (!head.eos()) {
            if (head.matchChar('[')) {
                nesting++;
                part.push('[')
            }
            if (head.matchChar("]")) {
                if (nesting == 0) {
                    const labelEnd = { line:head.pos.line, ch:head.pos.ch - 1 }
                    // open a substream
                    try {
                        stream.open(labelStart, labelEnd)
                        matchInline(stream)
                    } finally {
                        stream.close();
                    }
                    const value = part.join('')
                    return head.commit(value)
                } else {
                    nesting--;
                    part.push(']')
                }
            } else {
                part.push(head.nextCodepoint())
            }
        }

    }
    return head.rollback();
}

/** match the () part of a Markdown link */
function matchLinkTarget(stream:Stream) {
    const head = stream.top
    head.begin()
    if (head.matchChar("(") ){
        head.ignoreSpaces()
        // link is optional 
        const hasLink = matchURLInBrackets(stream) || matchURI(stream);
        head.ignoreSpaces()
        // title is optional
        matchLinkTitle(stream) // optional
        if (head.ignoreSpaces().matchChar(")")) {
            return head.commit()
        }
    }
    return head.rollback();

}

function matchURI(stream:Stream) {
    const head = stream.top
    head.begin("url")
    if (head.ignoreSpaces().matchReg(/^[a-zA-Z0-9-_.~:/?#@!$&*+,;=%]+/)) {
        return head.commit()
    }
    return head.rollback()
}

/** match a URI in brackets
 * 
 * value is the encoded URI
 */
function matchURLInBrackets(stream:Stream) {
    const head = stream.top
    head.begin("url")
    if (head.ignoreSpaces().matchChar("<")) {
        let part:string[] = []
        while (!head.eos()) {
            if (head.matchChar(">")) {
                const value = encodeURI(part.join(''))
                return head.commit(value)
            } else {
                part.push(head.nextCodepoint())
            }
        }
    }
    return head.rollback();
}

function matchLinkTitle(stream:Stream) {
    const head = stream.top
    head.begin('title')
    if (head.matchChar('"')) {
        const part:string[] = []
        while (!head.eos()) {
            if (head.matchChar('"')) {
                const value= part.join('')
                return head.commit(value)
            } 
            part.push(head.nextCodepoint())
        }
    }
    head.rollback();
}

export function parseMarkdown(text:string | MultilineString) {
    const multilines = typeof text == "string" ? new MultilineString(text.split(/\r?\n/)) : text
    const stream = new Stream(multilines)
    const head = stream.top
    
    while (!head.eos()) {
        const tokenFound = 
            matchWikilink(stream) 
            || matchLink(stream);
        if (!tokenFound) {
            head.skip(1)
        }
    }
    if (!posEq(head.lastMark, head.end)) {
        head.pushText(head.lastMark, head.end)
    }
}

//#endregion