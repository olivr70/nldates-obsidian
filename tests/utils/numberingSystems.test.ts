import { makeDigitsLatin, NumSystemDigits } from "../../src/utils/numberingSystems"


describe("Numbering systems", () => {
    describe("makeDigitsLatin()", () => {
        test("should replace known numbering systems", () => {
            for (let ns of Object.entries(NumSystemDigits)) {
                const str = ns[1].join('')
                const res = makeDigitsLatin(str)
                expect(res).toEqual("0123456789")
            }
        })
    })
})