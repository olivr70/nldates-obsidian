
import { alt, named, seq, zeroOrMore } from "./regex"; 
import { isHighSurrogate } from "./unicode";
import { AssertionError } from "assert";


export function linesToText(lines:string[], start:number = 0, end:number = lines.length) {
    return lines.slice(start, end).join("\n")
}


const punctuationCharacters: string[] = [
    "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
    ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"
  ];

const VALID_ESCAPE = /\\[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/

interface Mdlink {
    label:string
    url:string 
    title?:string
}

interface MdWikilink {
    page:string
    alias?:string
}


type TokenValue = object | string | number | Date
type ValueFunc = (text:string, children:Token[]) => TokenValue


interface Token {
    type:string
    start: number;
    end: number;
    text?: string;
    value?: TokenValue
    children?: Token[]
}


function getChildren(token:Partial<Token>, type:string) {
    return token.children?.filter((t) => t.type == type)
}

function getChild(token:Partial<Token>, type:string) {
    return getChildren(token, type)?.[0]
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

const EOT= "\u0004"


class State {

    constructor(text:string, pos:number, type:string, valueFunc?:ValueFunc) {
        this.pos = pos
        this.token = { type, start:pos, children:[], text}
        this.valueFunc = valueFunc
    }
    get lastChild():Token | undefined { 
        return this.token.children[this.token.children.length - 1] 
    }
    get lastMark():number {
        return this.lastChild?.end ?? this.pos
    }

    pos:number;
    token:Partial<Token>;
    valueFunc?:ValueFunc
}

export class Head {
    text:string;
    states:State[] = [];

    constructor(text:string) {
        this.text = text;
        this.states.push(new State(text, 0, "root"))
    }

    get state() { return this.states[this.states.length - 1] }
    get inProgress():Partial<Token> { return this.state.token }
    get root():Partial<Token> { return this.states[0].token }
    get pos() { return this.state.pos }
    get lastMark() { 
        const lastChild = this.inProgress.children[this.inProgress.children.length - 1] 
        return lastChild !== undefined ? lastChild.end : this.state.pos
    }
    set pos(newPos:number) { this.state.pos = newPos }

    // absolute access
    eosAt(index:number) { return index >= this.text.length }
    peekCharAt(index:number) { return this.eosAt(index) ? EOT : this.text[index]}
    
    peekAt(index:number):[string,number] { 
        if (this.eosAt(index)) return [EOT,0];
        const c= this.peekCharAt(index)
        if (c == '\\') {
            const n = this.peekChar(index + 1);
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
    eos(offset = 0) { return this.pos + offset >= this.text.length }
    peekChar(offset = 0) { return this.peekCharAt(this.pos + offset) }
    remaining() { return this.text.substring(this.pos)}
    /** match a character */
    matchChar(ch:string) {
        if (this.peekChar() == ch) { this.pos++; return true; }
        return false
    }
    /** match a character */
    matchString(target:string) {
        if (target == this.text.substring(this.pos, this.pos + target.length)) { 
            this.pos += target.length; return true; 
        }
        return false
    }
    peek(offset = 0):[string,number] { 
        if (this.eos(offset)) return [EOT,0];
        const c= this.peekChar(offset)
        if (c == '\\') {
            const n = this.peekChar(offset + 1);
            if (VALID_ESCAPE.test(n)) {
                return [n,2]
            } else {
                return ['\\', 1]
            }
        } else if (isHighSurrogate(c)) {
            return [ String.fromCodePoint(this.text.codePointAt(this.pos + offset)), 2]
        } else {
            return [c, 1]
        }
    }
    nextCodepoint() {
        const [v,l] = this.peek()
        this.pos += l;
        return v;
    }
    codepointIn(count:number) {
        let i = 0
        let offset = 0
        while (!this.eos(offset)) {
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
    pushNewToken(type:string, start:number, end:number, text?:string, children?:Token[], inValue?:ValueFunc | TokenValue) {
        if (type == undefined) return
        if (this.lastMark < start) {
            const textStart =this.lastMark
            const textEnd = start
            const newText:Token = { type:"text", start:textStart, end:textEnd, text: this.text.substring(textStart, textEnd) }
        }
        const tokenText = text || this.text.substring(start, end)
        const value = inValue ?? (typeof inValue == "function" ? inValue(tokenText, children) as TokenValue : inValue)
        const newToken:Token = { type, start, end, text:tokenText, children, value}
        this.state.token.children.push( newToken )
    }

    pushText(start:number, end:number) {
        const newText:Token = { type:"text", start, end, text: this.text.substring(start, end) }
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
    /** if value is passed, it is used even if valueFunc had been provided */
    commit(value?:any) { 
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
            this.pushNewToken(last.token.type, start, end, text, last.token.children, value ?? last.valueFunc)
            this.pos = last.pos
        } else {
            // just append the new tokens
            this.state.token.children.push(...last.token.children)
        }
        return true;}

    testReg(reg:RegExp):RegExpExecArray {
        return reg.exec(this.remaining())
    }

    matchReg(reg:RegExp, type:string = undefined, makeValue?:ValueFunc):RegExpExecArray {
        const m = this.testReg(reg)
        if (m && m.index == 0) { 
            this.pushNewToken(type, this.pos, this.pos + m[0].length, m[0], [], makeValue ); 
            this.pos += m[0].length
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
            this.pushNewToken(type, start, this.pos, textValue, [], makeValue)
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
                this.pushNewToken(type, start, this.pos, text.join(''), [], makeValue)
                return this.commit();
            }
            text.push(this.nextCodepoint())
        }
        return this.rollback();
    }

}





function matchWikilink(head:Head) {
    head.begin('wikilink')
    if (head.matchReg(/\[\[/)) {
        const start  = head.pos
        let value:Partial<MdWikilink> = {}
        let part:string[] = []
        while (!head.eos()) {
            const ch = head.peekChar()
            switch (ch) {
                case "|" : 
                    if (value.page) { 
                        // already in alias. | is treated like any character
                        part.push(ch) }
                    else { value.page = part.join('').trim(); part= []; }
                    break;
                case ']' : 
                    if (head.peekChar(1) == ']') {
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
                    }

                    break;
                default:
                    part.push(head.nextCodepoint())
            }
        }
    }
    return head.rollback();
}

export function matchLink(head:Head) {
    head.begin()
    if (matchLinkLabel(head) && matchLinkTarget(head)) {
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
function matchLinkLabel(head:Head) {
    head.begin("label")
    if (head.matchString("[") && head.peekChar() != "[") {
        let part:string[] = []
        let nesting = 0;
        while (!head.eos()) {
            if (head.matchChar('[')) {
                nesting++;
            }
            if (head.matchChar("]")) {
                if (nesting == 0) {
                    const value = part.join('')
                    return head.commit(value)
                } else {
                    nesting--;
                }
            } else {
                part.push(head.nextCodepoint())
            }
        }

    }
    return head.rollback();
}

/** match the () part of a Markdown link */
function matchLinkTarget(head:Head) {
    head.begin()
    if (head.matchChar("(") ){
        head.ignoreSpaces()
        // link is optional 
        const hasLink = matchURLInBrackets(head) || matchURI(head);
        head.ignoreSpaces()
        // title is optional
        matchLinkTitle(head) // optional
        if (head.ignoreSpaces().matchChar(")")) {
            return head.commit()
        }
    }
    return head.rollback();

}

function matchURI(head:Head) {
    head.begin("url")
    if (head.ignoreSpaces().matchReg(/^[a-zA-Z0-9-_.~:/?#@!$&*+,;=%]+/)) {
        return head.commit()
    }
    return head.rollback()
}

function matchURLInBrackets(head:Head) {
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

function matchLinkTitle(head:Head) {
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

export function parseMarkdown(text:string) {
    const head = new Head(text)
    
    while (!head.eos()) {
        const tokenFound = 
            matchWikilink(head) 
            || matchLink(head);
        if (!tokenFound) {
            head.skip(1)
        }
    }
    if (head.lastMark != head.text.length) {
        head.pushText(head.lastMark, head.text.length)
    }
}