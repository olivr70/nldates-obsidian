import NLDParserGeneric from "../../../src/locales/generic/parser-generic"

describe('NLDParserGeneric', () => {
    describe('fr', () => {
        test("should parse french dates", () => {
            const parser = new NLDParserGeneric("fr")
            const d1 = parser.getParsedDate("2 novembre 2023")
            const d2 = parser.getParsedDate("02/11/2023")
            expect(d1).toEqual(new Date(2023,10,2,12))
            expect(d2).toEqual(new Date(2023,10,2,12))
        })
    })
    
    describe('pt', () => {
        test("should parse portuguese dates", () => {
            const parser = new NLDParserGeneric("pt")
            const d1 = parser.getParsedDate("2 de  novembro  de 2023")
            const d2 = parser.getParsedDate("02/11/2023")
            expect(d1).toEqual(new Date(2023,10,2,12))
            expect(d2).toEqual(new Date(2023,10,2,12))
        })
    })

    
    describe('es', () => {
        test("should parse spanish dates", () => {
            const parser = new NLDParserGeneric("es")
            const d3 = parser.getParsedDate("jueves, 2 de noviembre de 2023")
            const d1 = parser.getParsedDate("2 de noviembre de 2023")
            const d2 = parser.getParsedDate("02/11/2023")
            expect(d1).toEqual(new Date(2023,10,2,12))
            expect(d2).toEqual(new Date(2023,10,2,12))
            expect(d3).toEqual(new Date(2023,10,2,12))
        })
    })
    describe('ja', () => {
        test("should parse japanese dates", () => {
            const parser = new NLDParserGeneric("ja")
            
            const d1 = parser.getParsedDate("2023年11月2日")
            const d2 = parser.getParsedDate("2023年11月2日木曜日")
            const d3 = parser.getParsedDate("2023/11/02")
            expect(d1).toEqual(new Date(2023,10,2,12))
            expect(d2).toEqual(new Date(2023,10,2,12))
            expect(d3).toEqual(new Date(2023,10,2,12))
        })
    })
    
    describe('el', () => {
        test("should parse greek dates", () => {
            const parser = new NLDParserGeneric("el")
            
            const d2 = parser.getParsedDate("2 Νοεμβρίου 2023")
            const d3 = parser.getParsedDate("Πέμπτη 2 Νοεμβρίου 2023")
            const d1 = parser.getParsedDate("2/11/23")
            expect(d2).toEqual(new Date(2023,10,2,12))
            expect(d3).toEqual(new Date(2023,10,2,12))
            expect(d1).toEqual(new Date(2023,10,2,12))
        })
    })

    
    describe('ar', () => {
        test("should parse greek dates", () => {
            const parser = new NLDParserGeneric("ar")

            // يناير (Yanāyir) - Janvier
            // فبراير (Fibrāyir) - Février
            // مارس (Māris) - Mars
            // أبريل (Abrīl) - Avril
            // مايو (Māyū) - Mai
            // يونيو (Yūniyū) - Juin
            // يوليو (Yūliyū) - Juillet
            // أغسطس (Aghusṭus) - Août
            // سبتمبر (Sibtambir) - Septembre
            // أكتوبر (Uktūbir) - Octobre
            // نوفمبر (Nūfambir) - Novembre
            // ديسمبر (Dīsambir) - Décembre


            // const d2 = parser.getParsedDate("2 نوفمبر 2023")
            const d2 = parser.getParsedDate("٢ نوفمبر ٢٠٢٣")
            const d3 = parser.getParsedDate("الخميس 2 نوفمبر 2023")
            const d1 = parser.getParsedDate("2\u200F/11\u200F/2023")
            expect(d2).toEqual(new Date(2023,10,2,12))
            expect(d3).toEqual(new Date(2023,10,2,12))
            expect(d1).toEqual(new Date(2023,10,2,12))
        })
    })

    
    describe('he', () => {
        test("should parse greek dates", () => {
            const parser = new NLDParserGeneric("he")
            
            const d2 = parser.getParsedDate("2 בנובמבר 2023")
            // const d3 = parser.getParsedDate("יום חמישי, 2 בנובמבר 2023")
            expect(d2).toEqual(new Date(2023,10,2,12))
            // expect(d3).toEqual(new Date(2023,10,2,12))
        })
    })
})