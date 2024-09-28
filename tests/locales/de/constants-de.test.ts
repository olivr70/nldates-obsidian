

import { regSrc } from "../../../src/utils/regex";
import { DAY_NAMES_DE_REGEX, ERA_REG_DE, FULL_YEAR_REG_DE, MONTH_NAMES_DE_PARTIAL3_REG, NCHR_ZTR_REG, parseMonthNameDe, parseYearDe, SIGNED_YEAR_REG, VUDGZ_REG } from "../../../src/locales/de/constants-de";




describe("eras", () => {
    describe("dedicated RegExps", () => {

        test("shoud match vor Christus", () => {
            const eraReg = NCHR_ZTR_REG
            expect("v. Chr.").toMatch(eraReg)
            expect("vc").toMatch(eraReg)
            expect("vc.").toMatch(eraReg)
            expect("vch").toMatch(eraReg)
            expect("vchr").toMatch(eraReg)
            expect("v.C").toMatch(eraReg)
            expect("v.C.").toMatch(eraReg)
            expect("v. Ch").toMatch(eraReg)
            expect("v. Ch.").toMatch(eraReg)
            expect("v. Chr.↵").toMatch(eraReg)
        })
        test("shoud match vor Zeitrechnung", () => {
            const eraReg = NCHR_ZTR_REG
            expect("vz").toMatch(eraReg)
            expect("vz.").toMatch(eraReg)
            expect("vzt").toMatch(eraReg)
            expect("vztr").toMatch(eraReg)
            expect("v.Z").toMatch(eraReg)
            expect("v.Z.").toMatch(eraReg)
            expect("v. Zt").toMatch(eraReg)
            expect("v. Zt.").toMatch(eraReg)
            expect("v. Ztr.").toMatch(eraReg)
        })
        test("shoud match “vor unserer derzeitigen Zeitrechnung.” (V.u.d.g.Z.)", () => {
            const eraReg = VUDGZ_REG
            expect("u Z").toMatch(eraReg)
            expect("u.Z.").toMatch(eraReg)
            expect("u d z").toMatch(eraReg)
            expect("u.d.z.").toMatch(eraReg)
            expect("u d g z").toMatch(eraReg)
            expect("u. d. g. z.").toMatch(eraReg)
            expect("u Z↵").toMatch(eraReg)
            expect("u.Z.").toMatch(eraReg)
            expect("u d z").toMatch(eraReg)
            expect("u.d.z.").toMatch(eraReg)
            expect("u d g z").toMatch(eraReg)
            expect("udgz").toMatch(eraReg)
            expect("u. d. g. z.").toMatch(eraReg)
            expect("v u Z↵").toMatch(eraReg)
            expect("v.u.Z.").toMatch(eraReg)
            expect("v.u d z").toMatch(eraReg)
            expect("v.u.d.z.").toMatch(eraReg)
            expect("v u d g z").toMatch(eraReg)
            expect("v.u. d. g. z.").toMatch(eraReg)
            expect("vudgz").toMatch(eraReg)
        })
    })
    describe("full pattern", () => {
        test("shoud match “vor Christus”", () => {
            const eraReg = ERA_REG_DE
            console.log(regSrc(eraReg))
            expect("v. Chr.").toMatch(eraReg)
            expect("n. Ztr.").toMatch(eraReg)
            expect("vc").toMatch(eraReg)
            expect("n. Z.").toMatch(eraReg)
        })
        test("shoud match “vor der gegenwärtigen Zeitrechnung”", () => {
            const eraReg = ERA_REG_DE
            console.log(regSrc(eraReg))
            expect("v. u. d. g. Z.").toMatch(eraReg)
            expect("uZ").toMatch(eraReg)
            expect("u. Z.").toMatch(eraReg)
        })
        test("shoud match “vor unserer derzeitigen Zeitrechnung”", () => {
            const eraReg = ERA_REG_DE
    
            console.log(eraReg.source)
            console.log(eraReg.toString().replace(/\\/g, "\\\\").slice(1,-1))
            expect("v. u. d. g. Z.").toMatch(eraReg)
            expect("vudgZ").toMatch(eraReg)
            expect("v u d g Z").toMatch(eraReg)
        })

    })
})

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
    test("FULL_YEAR_REG", () => {
        const check = new RegExp(`^${regSrc(FULL_YEAR_REG_DE)}$`, "i")
        console.log(regSrc(check))
       expect("100 v.CHR.").toMatch(check)
       expect("100 vchr").toMatch(check)
       expect("+100 n.ZTR").toMatch(check)
       expect("100 u. d. g. z.").toMatch(check)
       expect("-1").toMatch(check)
       expect("1").toMatch(check)
    })
    test("parseYearDe() should accept all german year, with or without era", () => {
        expect(parseYearDe("2020")).toEqual(2020)
        expect(parseYearDe("100")).toEqual(100)
        expect(parseYearDe("-100")).toEqual(-100)
        expect(parseYearDe("100 v. Ztr.")).toEqual(-100)
        expect(parseYearDe("100 vudgz")).toEqual(-100)
        expect(parseYearDe("100 v.u.d.g.z.")).toEqual(-100)
        expect(parseYearDe("100 v. u. d. g. z.")).toEqual(-100)
        expect(parseYearDe("100 v. Ztr.")).toEqual(-100)
        expect(parseYearDe("100 v. chr.")).toEqual(-100)
        // still failing
        expect(parseYearDe("100 vchr")).toEqual(-100)
    })
})

describe("MONTH_NAMES_DE_REGEX should", () => {
    test('match long names', () => {
        const reg = MONTH_NAMES_DE_PARTIAL3_REG
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Februar")).toBeTruthy();
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("März")).toBeTruthy();
        expect(MONTH_NAMES_DE_PARTIAL3_REG.exec("März")[0]).toEqual("März");
        const x = MONTH_NAMES_DE_PARTIAL3_REG.exec("Juni");
        expect(MONTH_NAMES_DE_PARTIAL3_REG.exec("Juni")[0]).toEqual("Juni");
        expect(MONTH_NAMES_DE_PARTIAL3_REG.exec("Juli")[0]).toEqual("Juli");
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Dezember")).toBeTruthy();
        expect(MONTH_NAMES_DE_PARTIAL3_REG.exec("Mai")[0]).toEqual("Mai");
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Jänner")).toBeTruthy();
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Febber")).toBeTruthy();
    });
    test('match lowercase names', () => {
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("märz")).toBeTruthy();
    });
    test('match stripped names', () => {
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Marz")).toBeTruthy();
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("marz")).toBeTruthy();
    });
    test('match short names', () => {
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Mär")).toBeTruthy();
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Jän")).toBeTruthy();
        expect(MONTH_NAMES_DE_PARTIAL3_REG.test("Feb")).toBeTruthy();
    });
    describe('parseMonthNameDe() should', () => {
        test('accept partial names', () => {
            expect(parseMonthNameDe("Juni")).toEqual(5);
            expect(parseMonthNameDe("Januar")).toEqual(0);
            expect(parseMonthNameDe("FEBR")).toEqual(1);
            expect(parseMonthNameDe("marz")).toEqual(2);
        })
        test('should return NaN for ambiguous keys', () => {
            expect(parseMonthNameDe("Ju")).toBe(NaN);
            expect(parseMonthNameDe("J")).toBe(NaN);
        })

    })
});

describe("DAY_NAMES_DE_REGEX should", () => {
    const reg = DAY_NAMES_DE_REGEX;
    test('match long day names', () => {
        expect(reg.test("Sonntag")).toBeTruthy();
        expect(reg.test("Montag")).toBeTruthy();
        expect(reg.test("Dienstag")).toBeTruthy();
        expect(reg.test("Mittwoch")).toBeTruthy();
        expect(reg.test("Donnerstag")).toBeTruthy();
        expect(reg.test("Freitag")).toBeTruthy();
        expect(reg.test("Samstag")).toBeTruthy();
    });
    test('match lowercase names', () => {
        expect(reg.test("sonntag")).toBeTruthy();
        expect(reg.test("mittwoch")).toBeTruthy();
    });
    test('match short names', () => {
        expect(reg.test("So")).toBeTruthy();
        expect(reg.test("Mo")).toBeTruthy();
        expect(reg.test("Di")).toBeTruthy();
        expect(reg.test("Mi")).toBeTruthy();
        expect(reg.test("Do")).toBeTruthy();
        expect(reg.test("Fr")).toBeTruthy();
        expect(reg.test("Sa")).toBeTruthy();
    });
});