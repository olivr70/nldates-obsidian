import { Writable } from "stream";
import { Mdlink, Token, TokenValue } from "./markdown";

type Converter = (token:Partial<Token>, out:StringStream) => void;

type TagConverter = { open:Converter, close?:Converter}

const Converters:Record<string, TagConverter> = {
    "text": { open: (t,o) => o.push(valueToString(t.text)) },
    "bold": { open: (t,o) => o.push("<b>"), close: (t,o) => o.push("</b>") },
    "italic": { open: (t,o) => o.push("<i>"), close: (t,o) => o.push("</i>") },
    "hilite": { open: (t,o) => o.push("<span>"), close: (t,o) => o.push("</span>") },
    "barred": { open: (t,o) => o.push("<s>"), close: (t,o) => o.push("</s>") },
    "link": { 
        open: (t,o) => {
            const info = t.value as Mdlink
            o.push(openingTag("a", { ...(info.url && { href:info.url }), ...(info.title && { title:info.title})}))
        },
        close: (t,o) => o.push("</a>")
    }
}


class StringStream {
    lines:string[] = []
    push(some:string) { this.lines.push(some)}
    toString() { return this.lines.join("")}
}

export function toHtml(token:Partial<Token>) {
    let result = new StringStream()
    toHtmlInner(token, result)
    return result.toString();
}

export function childrenToHtml(token:Partial<Token>) {
    let result = new StringStream()
    childrenToHtmlInner(token, result)
    return result.toString();
}

function toHtmlInner(token:Partial<Token>, out:StringStream) {
    const {open,close} = Converters[token.type] ?? {}
    open?.(token, out)
    childrenToHtmlInner(token, out)
    close?.(token, out)
}

function childrenToHtmlInner(token:Partial<Token>, out:StringStream) {
    if (token.children) {
        for (let c of token.children) {
            toHtmlInner(c,out)
        }
    }
}


export function valueToString(value:TokenValue):string {
    switch (typeof value) {
        case "string" : return value;
        case "number" : return value.toString()
        case "object" : {
            if (value instanceof Date) {
                return value.toISOString()
            } else {
                return value.toString()
            }
        }
    }
}

export function openingTag(name:string, attributes?:Record<string,string>) {
    let attr = ""
    if (attributes) {
        for (let a of Object.entries(attributes)) {
            attr += " "
            attr += a[0]
            if (a[1] !== undefined) {
                attr+= '="'
                attr+= quoteAttr(a[1], true)
                attr+= '"'
            }
        }
    }
    return `<${name}${attr}>`
}


export function closingTag(name:string) {
    return `</${name}>`
}

function quoteAttr(str:string, preserveCR:boolean) {
    const cr = preserveCR ? '&#13;' : '\n';
    return ('' + str) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&#39;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n/g, cr) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, cr);
}