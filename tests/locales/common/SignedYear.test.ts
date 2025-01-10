import { SIGNED_YEAR_REG } from "../../../src/locales/common/constants"

describe("years", () => {
    test("SIGNED_YEAR_REG", () => {
       expect("2022").toMatch(SIGNED_YEAR_REG)
       expect("+100").toMatch(SIGNED_YEAR_REG)
       expect("-100").toMatch(SIGNED_YEAR_REG)
       expect("-1").toMatch(SIGNED_YEAR_REG)
       expect("1").toMatch(SIGNED_YEAR_REG)
       // 
       expect("0").not.toMatch(SIGNED_YEAR_REG)
       expect("00").not.toMatch(SIGNED_YEAR_REG)
       expect("000").not.toMatch(SIGNED_YEAR_REG)
       expect("0000").not.toMatch(SIGNED_YEAR_REG)
       expect("-0").not.toMatch(SIGNED_YEAR_REG)
       expect("-00").not.toMatch(SIGNED_YEAR_REG)
       expect("-000").not.toMatch(SIGNED_YEAR_REG)
       expect("-0000").not.toMatch(SIGNED_YEAR_REG)
    })
})