import { range, rangeIsAfter, rangeIsBefore, rangeOverlaps } from "../../src/utils/multilineSting"
import { asToken, deepestTokenAt, getDescendant, Head, isInType, matchInline, matchLink, matchWikilink, Mdlink as MdLink, MdWikilink, rangeOverlapsType, Stream, Token } from "../../src/utils/markdown"
import { toHtml } from "../../src/utils/markdownToHtml"

function expectValidLink(text:string, expected?:MdLink, expectedHtml?:string) {
    const h = new Stream(text)
    expect(matchLink(h)).toBeTruthy()
    const linkToken = h.top.root
    expect(h.top.root.text).toEqual(text)

    const link = getDescendant(h.top.root, "link")
    if (expected) {
        expect(link?.value).toEqual(expected)
    }
    if (expectedHtml) {
        const html = toHtml(link)
        expect(html).toEqual(expectedHtml)
    }
}
function expectValidWikilink(text:string, expected?:MdWikilink) {
    const h = new Stream(text)
    expect(matchWikilink(h)).toBeTruthy()
    expect(h.top.root.text).toEqual(text)
    if (expected) {
        const link = getDescendant(h.top.root, "wikilink")
        expect(h.top.root.value).toEqual(expected)
    }
}
function expectInline(text:string, count:number, expectedHtml:string) {
    const h = new Stream(text)
    expect(matchInline(h)).toBeTruthy()

    if (expectedHtml)
    {   const html = toHtml(h.top.root)
        expect(html).toEqual(expectedHtml)
    }

    expect(h.top.root.text).toEqual(text)
    expect(h.top.root.children.length).toEqual(count)
    
    return asToken(h.top.inProgress)
}

//#region markdown parsing
describe("markdown parsing", () => {
    //#region Range
    describe("Range", () => {
        test("rangeIsBefore specs", () => {
            // partials
            expect(rangeIsBefore(range(1,0,2,20), {})).toBeFalsy()
            expect(rangeIsBefore(range(1,0,2,20), range(3, undefined, 3, undefined))).toBeTruthy()
            expect(rangeIsBefore(range(1,0,2,20), range(0, undefined, 1, undefined))).toBeFalsy()
            // full
            const ref = range(1,10,1,20)
            expect(rangeIsBefore(range(0,0,0,10), ref)).toBeTruthy()
            expect(rangeIsBefore(ref, ref)).toBeFalsy()
            expect(rangeIsBefore(range(0,0,1,15), ref)).toBeFalsy()
            expect(rangeIsBefore(range(1,11,1,15), ref)).toBeFalsy()
            expect(rangeIsBefore(range(2,0,2,20), ref)).toBeFalsy()
        })
        test("rangeIsAfter specs", () => {
            // partials
            expect(rangeIsAfter(range(1,0,2,20), {})).toBeFalsy()
            expect(rangeIsAfter(range(1,0,2,20), range(0, undefined, 0, undefined))).toBeTruthy()
            expect(rangeIsAfter(range(1,0,2,20), range(0, undefined, 1, undefined))).toBeTruthy()
            // full
            const ref = range(1,10,1,20)
            expect(rangeIsAfter(range(0,0,0,10), ref)).toBeFalsy()
            expect(rangeIsAfter(range(0,0,1,10), ref)).toBeFalsy()
            expect(rangeIsAfter(ref, ref)).toBeFalsy()
            expect(rangeIsAfter(range(1,13,1,15), ref)).toBeFalsy()
            expect(rangeIsAfter(range(1,20,1,30), ref)).toBeTruthy()
            expect(rangeIsAfter(range(2,0,2,20), ref)).toBeTruthy()
        })
        test("rangeIsBefore and rangeIsAfter coherence", () => {
            const fixtures = [
                [range(1,10,1,20), range(1,10,1,20)],   // identical
                [range(1,10,1,20), range(1,30,1,40)],   // before
                [range(1,10,1,35), range(1,30,1,40)],   // overlapping
                [range(1,25,1,35), range(1,30,1,40)],   // inside
                [range(1,25,1,45), range(1,30,1,40)],   // overlapping
                [range(1,45,1,55), range(1,45,1,55)],   // after
            ]
            for (let s of fixtures) {
                const [a,b] = s
                const aBeforeB = rangeIsBefore(a,b)
                const aAfterB = rangeIsAfter(a,b)
                const bBeforeA = rangeIsBefore(b,a)
                const bAfterA = rangeIsAfter(b,a)
                const aOverlapsB = rangeOverlaps(a,b)
                const bOverlapsA = rangeOverlaps(b,a)
                expect(aOverlapsB == bOverlapsA).toBeTruthy()
                // if A is before B, B is not before A and B does not overlap A
                expect(aBeforeB).toEqual(!bBeforeA && !bOverlapsA)
                // if A is before B, B is not after A and B does not overlap A
                expect(aBeforeB).toEqual(!aAfterB && !bOverlapsA)
                expect(bBeforeA).toEqual(!aBeforeB && !bOverlapsA)
                expect(bBeforeA).toEqual(!bAfterA && !bOverlapsA)
            }
        })
        test("rangeOverlaps specs", () => {
            const ref = range(1,10,1,20)
            // partial
            expect(rangeOverlaps(range(0,0,0,10), undefined)).toBeFalsy()
            expect(rangeOverlaps(range(0,0,0,10), {})).toBeFalsy()
            expect(rangeOverlaps(range(0,undefined,4,undefined), undefined)).toBeFalsy()
            expect(rangeOverlaps(range(0,undefined,4,undefined), ref)).toBeTruthy()
            // full
            expect(rangeOverlaps(ref, ref)).toBeTruthy()
            expect(rangeOverlaps(range(0,0,0,10), ref)).toBeFalsy()
            expect(rangeOverlaps(range(0,0,1,10), ref)).toBeFalsy()
            expect(rangeOverlaps(range(0,0,1,11), ref)).toBeTruthy()
            expect(rangeOverlaps(range(0,0,1,25), ref)).toBeTruthy()
            expect(rangeOverlaps(range(1,10,1,25), ref)).toBeTruthy()
            expect(rangeOverlaps(range(1,12,1,25), ref)).toBeTruthy()
            expect(rangeOverlaps(range(1,20,1,25), ref)).toBeFalsy()
            expect(rangeOverlaps(range(2,0,2,25), ref)).toBeFalsy()
        })
    })
    //#endregion
    //#region Token predicates
    describe("token predicates", () => {
        test("rangeOverlapsType()", () => {
            const someTok:Partial<Token> = { start:{line:1,ch:10}, end:{line:1,ch:20}, type:"xxx"}
            expect(rangeOverlapsType(someTok, range(0,1, 0,5), "xxx")).toBeFalsy()
            expect(rangeOverlapsType(someTok, range(0,1,0, 10), "xxx")).toBeFalsy()
            expect(rangeOverlapsType(someTok, range(1,1,1, 15), "xxx")).toBeTruthy()
            expect(rangeOverlapsType(someTok, range(1,1,1, 22), "xxx")).toBeTruthy()
            expect(rangeOverlapsType(someTok, range(1,12,1, 15), "xxx")).toBeTruthy()
            expect(rangeOverlapsType(someTok, range(1,12,1, 22), "xxx")).toBeTruthy()
            expect(rangeOverlapsType(someTok, range(1,20,1, 22), "xxx")).toBeFalsy()
            expect(rangeOverlapsType(someTok, range(1,22,1, 34), "xxx")).toBeFalsy()
            expect(rangeOverlapsType(someTok, range(2,12,2, 18), "xxx")).toBeFalsy()
        })
    })
    //#endregion
    //#region inline parsing
    describe("inline parsing", () => {
        
        test("should parse simple text", () => {
            const text1 = expectInline("Hello", 1, "Hello")
            expect(text1.children[0].type).toEqual("text")
            expect(text1.children[0].text).toEqual("Hello")
        })
        test("should parse simple text", () => {
            const it1 = expectInline("*Hello*", 1, "<i>Hello</i>")
            expect(it1.children[0].type).toEqual("italic")
            expect(it1.children[0].value).toEqual("Hello")
            const it2 = expectInline("_Ola_", 1, "<i>Ola</i>")
            expect(it2.children[0].type).toEqual("italic")
            expect(it2.children[0].value).toEqual("Ola")
            const bold1 = expectInline("**Halo**", 1, "<b>Halo</b>")
            expect(bold1.children[0].type).toEqual("bold")
            expect(bold1.children[0].value).toEqual("Halo")
            const bold2 = expectInline("__Salut__", 1, "<b>Salut</b>")
            expect(bold2.children[0].type).toEqual("bold")
            expect(bold2.children[0].value).toEqual("Salut")
        })
        test("should parse flat markup", () => {
            const t1 = expectInline("Hello *World*", 2, "Hello <i>World</i>")
            const html1 = toHtml(t1)
            expect(deepestTokenAt(t1, {line:0,ch:8})?.type).toEqual("text")
            // at extremities of string
            expectInline("*Hello* World", 2, "<i>Hello</i> World")
            expectInline("Brave *new* world", 3, "Brave <i>new</i> world")
            // bold with stars
            expectInline("Hello **World**", 2, "Hello <b>World</b>")
            expect(deepestTokenAt(t1, {line:0,ch:9})?.type).toEqual("text")
            expectInline("_Hello_ **World**", 3, "<i>Hello</i> <b>World</b>")
            expectInline("__Hello__ **World**", 3, "<b>Hello</b> <b>World</b>")
            expectInline("==Hello== **World**", 3, "<span>Hello</span> <b>World</b>")
            expect(deepestTokenAt(t1, {line:0,ch:2})?.type).toEqual("text")
            expectInline("~~Hello~~ **World**", 3, "<s>Hello</s> <b>World</b>")
            expect(deepestTokenAt(t1, {line:0,ch:2})?.type).toEqual("text")
        })
        
        test("should parse nested markup", () => {
            const t1 = expectInline("Hello * _rise_ *", 2, "Hello <i> <i>rise</i> </i>")
            const t2 = expectInline("Hello ** __rise__ **", 2, "Hello <b> <b>rise</b> </b>")
            const t3 = expectInline("== _Hello_ **World** ==", 1, "<span> <i>Hello</i> <b>World</b> </span>")
            expect(isInType(t3, {line:0,ch:5}, "hilite")).toBeTruthy()
            expect(isInType(t3, {line:0,ch:5}, "italic")).toBeTruthy()
            expect(isInType(t3, {line:0,ch:5}, "bold")).toBeFalsy()
            expect(isInType(t3, {line:0,ch:15}, "bold")).toBeTruthy()
        })
    })
    //#endregion
    //#region matchLink
    describe("matchLink", () => {
        test("should parse simple case", () => {
            expectValidLink("[someName](someUri)", { label:"someName", url:"someUri"})
        })
        test("should parse with title", () => {
            expectValidLink('[someName](someUri "someTitle")', { label:"someName", url:"someUri", title:"someTitle"})
        })
        test("should parse with pointy brackets", () => {
            expectValidLink("[link](</my uri>)", { label:"link", url:"/my%20uri"})
        })
        test("should support brackets nesting in link text", () => {
            expectValidLink("[link [again]](</my uri>)", { label:"link [again]", url:"/my%20uri"})
            expectValidLink("[link [again [more]]](</my uri>)", { label:"link [again [more]]", url:"/my%20uri"})
        })
        test("should parse HTML entities in URL", () => {
            expectValidLink("[link](http://www.example.com/foo%20b&auml;)", { label:"link", url:"http://www.example.com/foo%20b&auml;"})
        })
        test("should accept empty label", () => {
            // https://spec.commonmark.org/0.31.2/#example-484
            expectValidLink('[](./target.md)', { label:"", url:"./target.md"},'<a href="./target.md"></a>')
        })
        test("should accept empty uri", () => {
            // https://spec.commonmark.org/0.31.2/#example-485
            expectValidLink('[link]()', { label:"link", url:undefined},"<a>link</a>")
        })
        test("should parse empty link with title", () => {
            expectValidLink('[]("title")', { label:"", url:undefined, title:"title"},'<a title="title"></a>')
        })
        test("should parse empty link", () => {
            expectValidLink('[]()', { label:"", url:undefined},'<a></a>')
        })
        describe("with complex labels", () => {
            test("should accept simple inline", ()  => {
                expectValidLink("[*someName*](someUri)", { label:"*someName*", url:"someUri"}, '<a href="someUri"><i>someName</i></a>')
                expectValidLink("[_someName_](someUri)", { label:"_someName_", url:"someUri"})
            })
            test("should accept complex inline", ()  => {
                expectValidLink("[some **Link**](someUri)", { label:"some **Link**", url:"someUri"}, '<a href="someUri">some <b>Link</b></a>')

            })
        })
    })
    //#endregion
    //#region wikilink
    describe("wikilink", () => {
        test("should parse simple", () => {
            expectValidWikilink("[[somePage]]")
        })
        test("should parse with alias", () => {
            expectValidWikilink("[[somePage|someAlias]]")
        })
        test("should handle escaped chars", () => {
            expectValidWikilink("[[somePage\\[1\\]|someAlias]]")
            expectValidWikilink("[[some \\| Page|someAlias]]")
        })
        
        test("should accept inline markup in alias", () => {
            expectValidWikilink("[[somePage\\[1\\]|some _italic_ alias]]")
            expectValidWikilink("[[somePage\\[1\\]|some **bold** alias]]")
            expectValidWikilink("[[some \\| Page|someAlias]]")
        })
        test("should parse empty", () => {
            expectValidWikilink("[[]]")
        })
    })
    //#endregion
})
//#endregion