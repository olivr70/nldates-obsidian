import { Head, matchLink } from "../../src/utils/markdown"

function expectValidLink(text:string) {
    const h = new Head(text)
    expect(matchLink(h)).toBeTruthy()
    expect(h.root.text).toEqual(text)
}

describe("markdown parsing", () => {
    describe("matchLink", () => {
        test("should parse simple case", () => {
            expectValidLink("[someName](someUri)")
        })
        test("should parse with title", () => {
            expectValidLink('[someName](someUri "someTitle")')
        })
        test("should parse with pointy brackets", () => {
            expectValidLink("[link](</my uri>)")
        })
        test("should support brackets nesting in link text", () => {
            expectValidLink("[link [again]](</my uri>)")
            expectValidLink("[link [again [more]]](</my uri>)")
        })
        test("should parse HTML entities", () => {
            expectValidLink("[link](http://www.example.com/foo%20b&auml;)")
        })
        test("should accept empty label", () => {
            // https://spec.commonmark.org/0.31.2/#example-484
            expectValidLink('[](./target.md))')
        })
        test("should accept empty uri", () => {
            // https://spec.commonmark.org/0.31.2/#example-485
            expectValidLink('[link]()')
        })
        test("should parse empty link with title", () => {
            expectValidLink('[]("title")')
        })
        test("should parse empty link", () => {
            expectValidLink('[]()')
        })
    })
})