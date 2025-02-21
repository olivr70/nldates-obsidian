
import {expect} from '@jest/globals';

import "./date-equality"

export function testFullMatches(r:RegExp, ...fixtures:any[]) {
    for (const f of fixtures) {
        test(`should fully match ${f}`, () => {
            expect(r.exec(f)?.[0]).toEqual(f)
        })
    }
}

export function testPartialMatches(r:RegExp, ...fixtures:any[]) {
    for (const f of fixtures) {
        test(`should partially match ${f}`, () => {
            const text = Array.isArray(f) ? f[0] : String(f)
            const expected = Array.isArray(f) ? f[1] : null;
            const match = r.exec(text);
            expect(match).not.toBeNull()
            if (expected != null) {
                expect(match?.[0]).toEqual(expected)
            }
        })
    }
}
export function testNoMatches(r:RegExp, ...fixtures:any[]) {
    for (const f of fixtures) {
        test(`should not match ${f}`, () => {
            expect(r.exec(f)).toBeNull()
        })
    }
}

export function testMap<V,R>(func:(v:V) => R, ...fixtures:[V,R][]) {
    for (const f of fixtures) {
        test(`should return ${f[1]} for ${f[0]}`, () => {
            const res = func(f[0])
            try {
                expect(res).toEqual(f[1])
            } catch (e) {
                console.log(`Unexpected result for ${func.name}`, res, "\nShould have been", f[1])
                throw e;
            }
        })
    }
}