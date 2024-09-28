import { parseIsoDateZulu } from "../../../src/locales/common/constants"

describe('IsoPatchParser', () => {
    test('should set timezone to 0', () => {
        expect(parseIsoDateZulu("2020-11-08Z")).toEqual({year:2020, month:11, day:8, hour: 12, timezoneOffset: 0})
    })
    test('should ignore other forms of ISO dates', () => {
        expect(parseIsoDateZulu("2020-11-08")).toEqual({})
        expect(parseIsoDateZulu("2020-11-08+01:00")).toEqual({})
    })
})