import { EOT, EOT_CP, LF, LF_CP, MultilineString, posEq, posLt, posLte } from "../../src/utils/multilineSting"

describe("Position", () => {
    test("posEq()", () => {
        expect(posEq({line:1,ch:10}, undefined)).toBeFalsy()
        expect(posEq({line:1,ch:10}, {})).toBeFalsy()
        expect(posEq(undefined, {ch:10,line:1})).toBeFalsy()
        expect(posEq({}, {ch:10,line:1})).toBeFalsy()
        expect(posEq({line:1,ch:10}, {ch:10,line:1})).toBeTruthy()
        expect(posEq({line:1,ch:10}, {ch:11,line:1})).toBeFalsy()
        expect(posEq({line:1,ch:10}, {ch:10,line:2})).toBeFalsy()
        expect(posEq({line:1,ch:10}, {ch:undefined, line:1})).toBeFalsy()
        expect(posEq({line:1,ch:10}, {ch:10, line:undefined})).toBeFalsy()
        expect(posEq({line:1,ch:10}, {ch:NaN, line:1})).toBeFalsy()
        expect(posEq({line:1,ch:10}, {ch:10, line:NaN})).toBeFalsy()
        expect(posEq({line:1,ch:10}, undefined)).toBeFalsy()
    })
    test("posLt()", () => {
        expect(posLt({line:1,ch:10}, undefined)).toBeFalsy()
        expect(posLt({line:1,ch:10}, {})).toBeFalsy()
        expect(posLt({line:1,ch:10}, {line:0})).toBeFalsy()
        expect(posLt(undefined, {line:1,ch:10})).toBeFalsy()
        expect(posLt({}, {line:1,ch:10})).toBeFalsy()
        expect(posLt({line:0}, {line:1,ch:10})).toBeTruthy()
        // 
        expect(posLt({line:1,ch:10}, {line:1, ch:10})).toBeFalsy()
        expect(posLt({line:1,ch:10}, {line:1, ch:11})).toBeTruthy()
        expect(posLt({line:1,ch:10}, {line:2, ch:0,})).toBeTruthy()
        expect(posLt({line:1,ch:10}, {ch:undefined, line:1})).toBeFalsy()
        expect(posLt({line:1,ch:10}, {ch:10, line:undefined})).toBeFalsy()
        expect(posLt({line:1,ch:10}, {ch:NaN, line:1})).toBeFalsy()
        expect(posLt({line:1,ch:10}, {ch:10, line:NaN})).toBeFalsy()
    })
    test("posLte()", () => {
        expect(posLte({line:1,ch:10}, undefined)).toBeFalsy()
        expect(posLte({line:1,ch:10}, {})).toBeFalsy()
        expect(posLte(undefined, {line:1,ch:10})).toBeFalsy()
        expect(posLte({}, {line:1,ch:10})).toBeFalsy()
        expect(posLte({line:1,ch:10}, {line:0})).toBeFalsy()
        expect(posLte({line:1,ch:10}, {line:1})).toBeFalsy()
        //
        expect(posLte({line:1,ch:10}, {line:1, ch:10})).toBeTruthy()
        expect(posLte({line:1,ch:10}, {line:1, ch:11})).toBeTruthy()
        expect(posLte({line:1,ch:10}, {line:2, ch:0,})).toBeTruthy()
        expect(posLte({line:1,ch:10}, {ch:undefined, line:1})).toBeFalsy()
        expect(posLte({line:1,ch:10}, {ch:10, line:undefined})).toBeFalsy()
        expect(posLte({line:1,ch:10}, {ch:NaN, line:1})).toBeFalsy()
        expect(posLte({line:1,ch:10}, {ch:10, line:NaN})).toBeFalsy()
    })
})

describe("MultilineString", () => {
    let alphabet = ["ABCDEFGHIJ","KLMNOPQRST","UVWXYZ"]
    const alphaCodepoints = [
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 10,
        75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 10,
        85, 86, 87, 88, 89, 90
      ];
      const FtoZCodepoints = [
          70, 71, 72, 73, 74, 10,
          75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 10,
          85, 86
        ];
    const makeFtoX = () => new MultilineString(alphabet, {line:0,ch:5}, {line:2, ch:2})
    let alpha:MultilineString
    let alphaPartial:MultilineString
    describe("construction", () => {
        describe("full", () => {
            
            beforeEach(() => {
                alpha = new MultilineString(alphabet)
            })
            test("setup should properly set default start and end", () => {
                expect(alpha.lines.length).toEqual(3)
                expect(posEq(alpha.start, {line:0,ch:0})).toBeTruthy()
                expect(posEq(alpha.end, {line:2,ch:6})).toBeTruthy()
            })
            test("should correct invalid positions", () => {
                expect(alpha.normalize(undefined)).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:-1, ch:10})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:-1, ch:-1})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:-1, ch:undefined})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:undefined, ch:undefined})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:1, ch:100})).toEqual({line:1, ch:11})
                expect(alpha.normalize({line:1, ch:-1})).toEqual({line:1, ch:0})
                expect(alpha.normalize({line:2, ch:100})).toEqual({line:2, ch:7})
                expect(alpha.normalize({line:4, ch:10})).toEqual({line:3, ch:0})
            })
        })
        describe("partial", () => {
            beforeEach(() => {
                alpha = makeFtoX()
            })
            test("should properly defined user start and end", () => {
                expect(alpha.lines.length).toEqual(3)
                expect(posEq(alpha.start, {line:0,ch:5})).toBeTruthy()
                expect(posEq(alpha.end, {line:2,ch:2})).toBeTruthy()
            })
            test("should not take into account *start* and *end*", () => {
                expect(alpha.normalize(undefined)).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:-1, ch:10})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:-1, ch:-1})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:-1, ch:undefined})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:undefined, ch:undefined})).toEqual({line:0, ch:0})
                expect(alpha.normalize({line:1, ch:100})).toEqual({line:1, ch:11})
                expect(alpha.normalize({line:1, ch:-1})).toEqual({line:1, ch:0})
                expect(alpha.normalize({line:2, ch:100})).toEqual({line:2, ch:7})
                expect(alpha.normalize({line:4, ch:10})).toEqual({line:3, ch:0})
            })
        })
    })
    describe("stream ends", () => { 
        describe("with full lines", () => {
            beforeEach(() => {
                alpha = new MultilineString(alphabet)
            })
            test("bounds should be", () => {
                expect(alpha.start).toEqual({line:0, ch:0})
                expect(alpha.end).toEqual({line:2, ch:6})
            })
            test("bos() should work", () => {
                expect(alpha.bos({line:0, ch:0})).toBeFalsy()
                expect(alpha.bos({line:99, ch:0})).toBeFalsy()
                expect(alpha.bos({line:-1, ch:-1})).toBeTruthy()
                expect(alpha.bos({line:-1, ch:0})).toBeTruthy()
                expect(alpha.bos({line:0, ch:undefined})).toBeFalsy()
                expect(alpha.bos({line:1, ch:undefined})).toBeFalsy()
                // all undefined position are considered beforeStream (bos() => true)
                expect(alpha.bos(undefined)).toBeTruthy()
                expect(alpha.bos({line:undefined, ch:undefined})).toBeTruthy()
                expect(alpha.bos({line:undefined, ch:0})).toBeTruthy()
                expect(alpha.bos({line:undefined, ch:0})).toBeTruthy()
            })
            test("eos() should work", () => {
                expect(alpha.eos({line:99, ch:0})).toBeTruthy()
                expect(alpha.eos(alpha.end)).toBeTruthy()
                expect(alpha.eos({line:0, ch:0})).toBeFalsy()
                expect(alpha.eos({line:-1, ch:-1})).toBeFalsy()
                expect(alpha.eos({line:-1, ch:0})).toBeFalsy()
                // all undefined position are considered beforeStream (bos() => true)
                expect(alpha.eos(undefined)).toBeFalsy()
                expect(alpha.eos({line:undefined, ch:undefined})).toBeFalsy()
                expect(alpha.eos({line:0, ch:undefined})).toBeFalsy()
                expect(alpha.eos({line:1, ch:undefined})).toBeFalsy()
                expect(alpha.eos({line:undefined, ch:0})).toBeFalsy()
                expect(alpha.eos({line:undefined, ch:0})).toBeFalsy()
            })
        })
        describe("with partial", () => {
            beforeEach(() => {
                alpha = makeFtoX()
            })
            test("bounds should be", () => {
                expect(alpha.start).toEqual({line:0, ch:5})
                expect(alpha.end).toEqual({line:2, ch:2})
            })
            test("bos() should work", () => {
                expect(alpha.bos({line:-1, ch:-1})).toBeTruthy()
                expect(alpha.bos({line:-1, ch:0})).toBeTruthy()
                expect(alpha.bos({line:0, ch:4})).toBeTruthy()
                expect(alpha.bos({line:0, ch:undefined})).toBeTruthy()
                // all positions 
                expect(alpha.bos({line:0, ch:5})).toBeFalsy()
                expect(alpha.bos({line:99, ch:0})).toBeFalsy()
                expect(alpha.bos({line:1, ch:undefined})).toBeFalsy()
                // all undefined lines are considered beforeStream (bos() => true)
                expect(alpha.bos(undefined)).toBeTruthy()
                expect(alpha.bos({line:undefined, ch:undefined})).toBeTruthy()
                expect(alpha.bos({line:undefined, ch:0})).toBeTruthy()
                expect(alpha.bos({line:undefined, ch:0})).toBeTruthy()
            })
            test("eos() should work", () => {
                expect(alpha.eos({line:99, ch:0})).toBeTruthy()
                expect(alpha.eos({line:2, ch:2})).toBeTruthy()
                expect(alpha.eos({line:3, ch:undefined})).toBeTruthy()
                expect(alpha.eos(alpha.end)).toBeTruthy()
                // 
                expect(alpha.eos({line:0, ch:0})).toBeFalsy()
                expect(alpha.eos({line:-1, ch:-1})).toBeFalsy()
                expect(alpha.eos({line:-1, ch:0})).toBeFalsy()
                expect(alpha.eos({line:2, ch:undefined})).toBeFalsy()
                // all undefined position are considered beforeStream (bos() => true)
                expect(alpha.eos(undefined)).toBeFalsy()
                expect(alpha.eos({line:undefined, ch:undefined})).toBeFalsy()
                expect(alpha.eos({line:0, ch:undefined})).toBeFalsy()
                expect(alpha.eos({line:1, ch:undefined})).toBeFalsy()
                expect(alpha.eos({line:undefined, ch:0})).toBeFalsy()
                expect(alpha.eos({line:undefined, ch:0})).toBeFalsy()
            })
        })
    })

    describe("accessors", () => {
        beforeEach(() => {
            alpha = new MultilineString(alphabet)
        })
        test("lineLength() should add extra LF", () => {
            expect(alpha.lineLength(0)).toEqual(11)
            expect(alpha.lineLength(2)).toEqual(6)
            expect(alpha.lineLength(-1)).toBeNaN()
            expect(alpha.lineLength(10)).toBeNaN()
        })
        test("line() should add extra LF", () => {
            expect(alpha.line(0)).toEqual("ABCDEFGHIJ\n")
            expect(alpha.line(2)).toEqual("UVWXYZ")
            expect(alpha.line(-1)).not.toBeDefined()
            expect(alpha.line(10)).not.toBeDefined()
        })
        test("charAt() should return character", () => {
            expect(alpha.charAt({line:-1,ch:0})).toEqual("\u0004")
            expect(alpha.charAt({line:0,ch:0})).toEqual("A")
            expect(alpha.charAt({line:0,ch:5})).toEqual("F")
            expect(alpha.charAt({line:0,ch:10})).toEqual(LF)
            expect(alpha.charAt({line:0,ch:11})).toEqual(LF)
            expect(alpha.charAt({line:0,ch:109})).toEqual(LF)
            expect(alpha.charAt({line:2,ch:5})).toEqual("Z")
            expect(alpha.charAt({line:2,ch:6})).toEqual(EOT)
            expect(alpha.charAt({line:2,ch:8})).toEqual(EOT)
            expect(alpha.charAt({line:3,ch:0})).toEqual("\u0004")
        })
        test("codePointAt() shouls return code", () => {
            expect(alpha.codePointAt({line:-1,ch:0})).toEqual(4)
            expect(alpha.codePointAt({line:0,ch:0})).toEqual("A".charCodeAt(0))
            expect(alpha.codePointAt({line:0,ch:5})).toEqual("F".charCodeAt(0))
            expect(alpha.codePointAt({line:0,ch:10})).toEqual(LF_CP)
            expect(alpha.codePointAt({line:0,ch:11})).toEqual(LF_CP)
            expect(alpha.codePointAt({line:0,ch:109})).toEqual(LF_CP)
            expect(alpha.codePointAt({line:1,ch:5})).toEqual("P".charCodeAt(0))
            expect(alpha.codePointAt({line:2,ch:6})).toEqual(EOT_CP)
            expect(alpha.codePointAt({line:2,ch:7})).toEqual(EOT_CP)
            expect(alpha.codePointAt({line:3,ch:0})).toEqual("\u0004".charCodeAt(0))
        })
        
    })
    describe("incrementors", () => {
        beforeEach(() => {
            alpha = new MultilineString(alphabet)
        })
        describe("next()", () => {
            test("should return start if pos is before start", () => {
                expect(alpha.next(undefined)).toEqual({line:0, ch:0})
                expect(alpha.next({line:undefined, ch:0})).toEqual({line:0, ch:0})
            })
            test("should consider undefined ch as 0", () => {
                expect(alpha.next({line:1, ch:undefined})).toEqual({line:1,ch:1})
            })
            test("next() should iterate on each character", () => {
                let pos = { line:0, ch:0 }
                pos  = alpha.next(pos)
                expect(pos).toEqual({line:0, ch:1})
                // go to next line
                pos = { line:0, ch:10 }
                pos  = alpha.next(pos)
                expect(pos).toEqual({line:1, ch:0})
            })
            test("next() should iterate on lines afater end", () => {
                // after end, inc() skips to new line every time
                let pos = { line:2, ch:6 }
                pos  = alpha.next(pos)
                expect(pos).toEqual({line:3, ch:0})
                pos  = alpha.next(pos)
                expect(pos).toEqual({line:4, ch:0})
                expect(alpha.next({line:4,ch:0})).toEqual({line:5, ch:0})
            })

        })
        test("next() should itearate on all characters", () => {
            let pos = { line:-1, ch:0 }
            let str = ""
            pos = alpha.next(pos)
            while (posLt(pos, alpha.end)) {
                str += alpha.charAt(pos)
                pos = alpha.next(pos)
            }
            expect(str.length).toEqual(28)
            expect(str).toEqual(alphabet.join("\n"))
            // after end, inc() skips to new line every time
            pos = { line:2, ch:6 }
            expect(alpha.next(pos)).toEqual({line:3, ch:0})
        })
        
        test("offset(, 1) should itearate on all characters", () => {
            let pos = { line:-1, ch:0 }
            let str = ""
            pos = alpha.offset(pos, 1)
            while (posLt(pos, alpha.end)) {
                str += alpha.charAt(pos)
                pos = alpha.offset(pos,1)
            }
            expect(str.length).toEqual(28)
            expect(str).toEqual(alphabet.join("\n"))
            // after end, inc() skips to new line every time
            pos = { line:2, ch:6 }
            expect(alpha.next(pos)).toEqual({line:3, ch:0})
        })
        

        
        test("next() should itearate on all characters", () => {
            const FtoX = makeFtoX()
            let str = ""
            let pos = FtoX.start
            while (posLt(pos, FtoX.end)) {
                str += FtoX.charAt(pos)
                pos = FtoX.next(pos)
            }
            expect(str.length).toEqual(19)
            expect(str).toEqual("FGHIJ\nKLMNOPQRST\nUV")
            // after end, inc() skips to new line every time
            pos = { line:2, ch:6 }
            expect(alpha.next(FtoX.end)).toEqual({line:2, ch:3})
        })

        test("offset(, 1) should itearate on partial characters", () => {
            const FtoX = makeFtoX()
            let pos = { line:-1, ch:0 }
            let str = ""
            pos = FtoX.start
            while (posLt(pos, FtoX.end)) {
                str += FtoX.charAt(pos)
                pos = FtoX.offset(pos,1)
            }
            expect(str.length).toEqual(19)
            expect(str).toEqual("FGHIJ\nKLMNOPQRST\nUV")
        })
        test("offset() should iterate on each character", () => {
            let pos = { line:0, ch:0 }
            expect(alpha.offset(pos, 11)).toEqual({line:1, ch:0})
            pos = { line:0, ch:10 }
            expect(alpha.offset(pos,5)).toEqual({line:1, ch:4})
            // after end, inc() skips to new line every time
            pos = { line:2, ch:5 }
            expect(alpha.offset(pos,2)).toEqual({line:3, ch:0})
            expect(alpha.offset(pos,4)).toEqual({line:5, ch:0})
            // after end, inc() skips to new line every time
            pos = { line:2, ch:6 }
            expect(alpha.offset(pos,10)).toEqual({line:12, ch:0})
        })
        test("offset() should iterate on all characters", () => {
            let pos = { line:-1, ch:0 }
            let str = ""
            pos = alpha.offset(pos,5)
            while (posLt(pos, alpha.end)) {
                str += alpha.charAt(pos)
                pos = alpha.offset(pos,5)
            }
            expect(str.length).toEqual(5)
            expect(str).toEqual("EJNSW")
        })    
        test("offset() should iterate on partial characters", () => {
            const FtoX = makeFtoX()
            let pos = FtoX.start
            let str = ""
            while (posLt(pos, FtoX.end)) {
                str += alpha.charAt(pos)
                pos = alpha.offset(pos,5)
            }
            expect(str.length).toEqual(4)
            expect(str).toEqual("F\nOT")
        })  
        
    })
    describe("iterator", () => {
        describe("with all the lines", () => {
            beforeEach(() => {
                alpha = new MultilineString(alphabet)
            })
            test("should insert LF at end of lines", () => {
                const test = [...alpha]
                const c = test.map(x => String.fromCharCode(x))
                expect([...alpha]).toEqual(alphaCodepoints)
            })
        })
        describe("with some lines", () => {
            beforeEach(() => {
                alpha = makeFtoX()
            })
            test("should insert LF at end of lines", () => {
                const test = [...alpha]
                const c = test.map(x => String.fromCharCode(x))
                expect([...alpha]).toEqual(FtoZCodepoints)
            })
        })
    })
    describe("substring()", () => {
        describe("with all the lines", () => {
            beforeEach(() => {
                alpha = new MultilineString(alphabet)
            })
            test("should work in single line", () => {
                expect(alpha.substring({line:0,ch:0},{line:0, ch:10})).toEqual("ABCDEFGHIJ")
                expect(alpha.substring({line:1,ch:1},{line:1, ch:4})).toEqual("LMN")
            })
            test("should add a LF on end of lines, except the last one", () => {
                expect(alpha.substring({line:0,ch:0},{line:0, ch:11})).toEqual("ABCDEFGHIJ\n")
                expect(alpha.substring({line:0,ch:0},{line:0, ch:20})).toEqual("ABCDEFGHIJ\n")
                expect(alpha.substring({line:2,ch:0},{line:2, ch:20})).toEqual("UVWXYZ")
            })
            test("should set defauts as start and end", () => {
                expect(alpha.substring()).toEqual("ABCDEFGHIJ\nKLMNOPQRST\nUVWXYZ")
                expect(alpha.substring({line:1, ch:5})).toEqual("PQRST\nUVWXYZ")
            })
            test("should work over line boundaries", () => {
                expect(alpha.substring({line:0,ch:5},{line:1, ch:5})).toEqual("FGHIJ\nKLMNO")
            })
        })
        
        describe("with some lines", () => {
            beforeEach(() => {
                alpha = makeFtoX()
            })
            test("should set defauts as start and end", () => {
                expect(alpha.substring()).toEqual("FGHIJ\nKLMNOPQRST\nUV")
                expect(alpha.substring({line:1, ch:5})).toEqual("PQRST\nUV")
            })
        })
        
    })
    describe("lineEnd()", () => {
        beforeEach(() => {
            alpha = new MultilineString(alphabet)
        })
        test("should return extra LF except for last line", () => {
            expect(alpha.lineEnd({line:1, ch:8})).toEqual("ST\n")
            expect(alpha.lineEnd({line:1, ch:10})).toEqual("\n")
            expect(alpha.lineEnd({line:2, ch:3})).toEqual("XYZ")
        })
        test("should return undefined if line is out of bounds", () => {
            expect(alpha.lineEnd({line:10, ch:0})).not.toBeDefined()
        })
        test("should return empty string if ch is out of bounds", () => {
            expect(alpha.lineEnd({line:1, ch:99})).toEqual("")
        })
        
    })
})