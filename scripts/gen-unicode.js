
import fs from "fs/promises"
import path from "path"

const VERSION = "16.0.0"

import generalCategory from '@unicode/unicode-16.0.0/General_Category/index.js'; // lookup map 
import unicode16 from '@unicode/unicode-16.0.0'; // lookup map 
import { unicodeName } from 'unicode-name'


import Alternate from '@unicode/unicode-16.0.0/Names/Alternate/index.js'; // lookup map from code point to aliases
import Control from '@unicode/unicode-16.0.0/Names/Control/index.js'; // lookup map from code point to aliases
import Correction from '@unicode/unicode-16.0.0/Names/Correction/index.js'; // lookup map from code point to aliases
import Figment from '@unicode/unicode-16.0.0/Names/Figment/index.js'; // lookup map from code point to aliases


// for each category, symbols.js contains an array of characters
import uppercaseSymbols from '@unicode/unicode-16.0.0/General_Category/Uppercase_Letter/symbols.js';
// for each category, ranges.js contains an array of UnicodeRange (begin, end, length)
import uppercaseRanges from '@unicode/unicode-16.0.0/General_Category/Uppercase_Letter/ranges.js';

import openBracketRegex from '@unicode/unicode-16.0.0/Bidi_Paired_Bracket_Type/Open/regex.js'
import closeBracketRegex from '@unicode/unicode-16.0.0/Bidi_Paired_Bracket_Type/Close/regex.js'

console.log("openBracketRegex", openBracketRegex)
console.log("closeBracketRegex", closeBracketRegex)

console.log(unicodeName("A"))

console.log(uppercaseSymbols)
console.log(uppercaseRanges)
console.log("Correction", Correction)
console.log("Alternate", Alternate)
console.log("Figment", Figment)

console.log("unicode16.Bidi_Class", unicode16.Bidi_Class)

console.log("unicode16", Object.getOwnPropertyNames(unicode16))
console.log("unicode16.__proto", Object.getOwnPropertyNames(Object.getPrototypeOf(unicode16)))
// console.log("unicode16.General_Category", Object.getOwnPropertyNames(unicode16.General_Category))
// console.log("unicode16.General_Category for A", unicode16.General_Category[0x41])
// console.log("unicode16.Binary_Property", unicode16.Binary_Property)
// console.log("unicode16.Binary_Property.White_Space", unicode16.Binary_Property.White_Space)
// console.log("unicode16.Block", unicode16.Block)
// console.log("unicode16.Script", typeof unicode16.Script, unicode16.Script)
// console.log(unicode16.General_Category[0])
// console.log("SPACE", Object.getOwnPropertyNames(generalCategory))
// console.log(Object.getOwnPropertyNames(generalCategory))


import UnicodeTrieBuilder from 'unicode-trie/builder.js';

const ScriptRanges = unicode16.Script

console.log("-----------------")
makeRanges("General_Category")
console.log("-----------------")

// await makeCodePointTrie(unicode16.Script, "src/utils/u-scriptOf.ts", "scriptOf")
// await makeCodePointTrie(unicode16.General_Category, "src/utils/u-categoryOf.ts", "categoryOf")

async function makeRanges(categoryName) {
    const category = await import(`@unicode/unicode-${VERSION}/${categoryName}/index.js`)
    console.log(categoryName," - ", category)
    let result= [];
    for (let i = 0; i < category.length; ++i) {
        console.log("  ++++++ ", category, "\n")
        const subCategory = category[i]
        const ranges = await import(`@unicode/unicode-${VERSION}/${categoryName}/${category}/range.js`)
        for (let r of ranges) {
            // console.log(r)
        }
    }
}

async function makeMultipleValuesTrie(values, somePath, funcName) {
    // Initialize the TrieBuilder 
    const trieBuilder = new UnicodeTrieBuilder();
    // Add Unicode data to the Trie 
    for (let v of values) {
        const value = v[0]
        for (let r of v[1]) {
            trieBuilder.setRange(r.begin, r.end, value);
        }
    }

    // Build the Trie 
    const trieData = trieBuilder.toBuffer();

    await saveTrie(somePath, trieData, allValues, funcName)
}




// Function to get the script of a character
function getScriptFromTrie(char) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined)
        return null;
    return trie.get(codePoint);
}

/** options
 * - data : the base64 data string
 * - func : the named of the export function
 */
async function saveTrie(somePath, buffer, values, func) {
    
    const trie64 = buffer.toString("base64")
    const segmentLength = 80;
    const segments = [];
    for (let i = 0; i < trie64.length; i += segmentLength) {
        segments.push(trie64.substring(i, i + segmentLength))
    }
    

    var file = await fs.open(somePath, "w+")
    await file.write("// WARNING : Automatically generated - do not modify\n")
    await file.write(`// Generated on ${new Date().toDateString()} ${new Date().toTimeString()}\n`)
    await file.write("import UnicodeTrie from 'unicode-trie'; \n")
    await file.write("\n")
    await file.write("const TRIE_DATA = [\n")
    for (const s of segments) {
        await file.write(`\t"${s}",\n`)
    }
    await file.write("];\n\n")
    
    await file.write("const TRIE_VALUES = [\n")
    for (const v of values) {
        await file.write(`\t"${v}",\n`)
    }
    await file.write("];\n\n")
    await file.write("const buf = Buffer.from(TRIE_DATA.join(''), 'base64')\n\n")
    await file.write("const TRIE = new UnicodeTrie(buf);\n\n");
    await file.write("\n\n")
    await file.write(`export function ${func}(someChar:string) {`)
    await file.write("  return TRIE_VALUES[TRIE.get(someChar.codePointAt(0))]")
    await file.write("}")
    await file.close();
}





// Example usage const text = "Hello, こんにちは, مرحبا!"; for (const char of text) { const script = getScriptFromTrie(char); console.log(`Character: ${char}, Script: ${script}`); }


// module.exports = { 
//     'General_Category': ['Cased_Letter', 'Close_Punctuation', 'Connector_Punctuation', 'Control', 'Currency_Symbol', 'Dash_Punctuation', 'Decimal_Number', 'Enclosing_Mark', 'Final_Punctuation', 'Format', 'Initial_Punctuation', 'Letter', 'Letter_Number', 'Line_Separator', 'Lowercase_Letter', 'Mark', 'Math_Symbol', 'Modifier_Letter', 'Modifier_Symbol', 'Nonspacing_Mark', 'Number', 'Open_Punctuation', 'Other', 'Other_Letter', 'Other_Number', 'Other_Punctuation', 'Other_Symbol', 'Paragraph_Separator', 'Private_Use', 'Punctuation', 'Separator', 'Space_Separator', 'Spacing_Mark', 'Surrogate', 'Symbol', 'Titlecase_Letter', 'Unassigned', 'Uppercase_Letter'],
//     'Binary_Property': ['ASCII', 'ASCII_Hex_Digit', 'Alphabetic', 'Any', 'Assigned', 'Bidi_Control', 'Bidi_Mirrored', 'Case_Ignorable', 'Cased', 'Changes_When_Casefolded', 'Changes_When_Casemapped', 'Changes_When_Lowercased', 'Changes_When_NFKC_Casefolded', 'Changes_When_Titlecased', 'Changes_When_Uppercased', 'Composition_Exclusion', 'Dash', 'Default_Ignorable_Code_Point', 'Deprecated', 'Diacritic', 'Emoji', 'Emoji_Component', 'Emoji_Modifier', 'Emoji_Modifier_Base', 'Emoji_Presentation', 'Expands_On_NFC', 'Expands_On_NFD', 'Expands_On_NFKC', 'Expands_On_NFKD', 'Extended_Pictographic', 'Extender', 'Full_Composition_Exclusion', 'Grapheme_Base', 'Grapheme_Extend', 'Grapheme_Link', 'Hex_Digit', 'Hyphen', 'IDS_Binary_Operator', 'IDS_Trinary_Operator', 'IDS_Unary_Operator', 'ID_Compat_Math_Continue', 'ID_Compat_Math_Start', 'ID_Continue', 'ID_Start', 'Ideographic', 'InCB', 'Join_Control', 'Logical_Order_Exception', 'Lowercase', 'Math', 'Modifier_Combining_Mark', 'NFKC_Simple_Casefold', 'Noncharacter_Code_Point', 'Other_Alphabetic', 'Other_Default_Ignorable_Code_Point', 'Other_Grapheme_Extend', 'Other_ID_Continue', 'Other_ID_Start', 'Other_Lowercase', 'Other_Math', 'Other_Uppercase', 'Pattern_Syntax', 'Pattern_White_Space', 'Prepended_Concatenation_Mark', 'Quotation_Mark', 'Radical', 'Regional_Indicator', 'Sentence_Terminal', 'Soft_Dotted', 'Terminal_Punctuation', 'Unified_Ideograph', 'Uppercase', 'Variation_Selector', 'White_Space', 'XID_Continue', 'XID_Start'],
//     'Bidi_Class': ['Arabic_Letter', 'Arabic_Number', 'Boundary_Neutral', 'Common_Separator', 'European_Number', 'European_Separator', 'European_Terminator', 'First_Strong_Isolate', 'Left_To_Right', 'Left_To_Right_Embedding', 'Left_To_Right_Isolate', 'Left_To_Right_Override', 'Nonspacing_Mark', 'Other_Neutral', 'Paragraph_Separator', 'Pop_Directional_Format', 'Pop_Directional_Isolate', 'Right_To_Left', 'Right_To_Left_Embedding', 'Right_To_Left_Isolate', 'Right_To_Left_Override', 'Segment_Separator', 'White_Space'],
//     'Script': ['Adlam', 'Ahom', 'Anatolian_Hieroglyphs', 'Arabic', 'Armenian', 'Avestan', 'Balinese', 'Bamum', 'Bassa_Vah', 'Batak', 'Bengali', 'Bhaiksuki', 'Bopomofo', 'Brahmi', 'Braille', 'Buginese', 'Buhid', 'Canadian_Aboriginal', 'Carian', 'Caucasian_Albanian', 'Chakma', 'Cham', 'Cherokee', 'Chorasmian', 'Common', 'Coptic', 'Cuneiform', 'Cypriot', 'Cypro_Minoan', 'Cyrillic', 'Deseret', 'Devanagari', 'Dives_Akuru', 'Dogra', 'Duployan', 'Egyptian_Hieroglyphs', 'Elbasan', 'Elymaic', 'Ethiopic', 'Garay', 'Georgian', 'Glagolitic', 'Gothic', 'Grantha', 'Greek', 'Gujarati', 'Gunjala_Gondi', 'Gurmukhi', 'Gurung_Khema', 'Han', 'Hangul', 'Hanifi_Rohingya', 'Hanunoo', 'Hatran', 'Hebrew', 'Hiragana', 'Imperial_Aramaic', 'Inherited', 'Inscriptional_Pahlavi', 'Inscriptional_Parthian', 'Javanese', 'Kaithi', 'Kannada', 'Katakana', 'Kawi', 'Kayah_Li', 'Kharoshthi', 'Khitan_Small_Script', 'Khmer', 'Khojki', 'Khudawadi', 'Kirat_Rai', 'Lao', 'Latin', 'Lepcha', 'Limbu', 'Linear_A', 'Linear_B', 'Lisu', 'Lycian', 'Lydian', 'Mahajani', 'Makasar', 'Malayalam', 'Mandaic', 'Manichaean', 'Marchen', 'Masaram_Gondi', 'Medefaidrin', 'Meetei_Mayek', 'Mende_Kikakui', 'Meroitic_Cursive', 'Meroitic_Hieroglyphs', 'Miao', 'Modi', 'Mongolian', 'Mro', 'Multani', 'Myanmar', 'Nabataean', 'Nag_Mundari', 'Nandinagari', 'New_Tai_Lue', 'Newa', 'Nko', 'Nushu', 'Nyiakeng_Puachue_Hmong', 'Ogham', 'Ol_Chiki', 'Ol_Onal', 'Old_Hungarian', 'Old_Italic', 'Old_North_Arabian', 'Old_Permic', 'Old_Persian', 'Old_Sogdian', 'Old_South_Arabian', 'Old_Turkic', 'Old_Uyghur', 'Oriya', 'Osage', 'Osmanya', 'Pahawh_Hmong', 'Palmyrene', 'Pau_Cin_Hau', 'Phags_Pa', 'Phoenician', 'Psalter_Pahlavi', 'Rejang', 'Runic', 'Samaritan', 'Saurashtra', 'Sharada', 'Shavian', 'Siddham', 'SignWriting', 'Sinhala', 'Sogdian', 'Sora_Sompeng', 'Soyombo', 'Sundanese', 'Sunuwar', 'Syloti_Nagri', 'Syriac', 'Tagalog', 'Tagbanwa', 'Tai_Le', 'Tai_Tham', 'Tai_Viet', 'Takri', 'Tamil', 'Tangsa', 'Tangut', 'Telugu', 'Thaana', 'Thai', 'Tibetan', 'Tifinagh', 'Tirhuta', 'Todhri', 'Toto', 'Tulu_Tigalari', 'Ugaritic', 'Vai', 'Vithkuqi', 'Wancho', 'Warang_Citi', 'Yezidi', 'Yi', 'Zanabazar_Square'],
//     'Script_Extensions': ['Adlam', 'Ahom', 'Anatolian_Hieroglyphs', 'Arabic', 'Armenian', 'Avestan', 'Balinese', 'Bamum', 'Bassa_Vah', 'Batak', 'Bengali', 'Bhaiksuki', 'Bopomofo', 'Brahmi', 'Braille', 'Buginese', 'Buhid', 'Canadian_Aboriginal', 'Carian', 'Caucasian_Albanian', 'Chakma', 'Cham', 'Cherokee', 'Chorasmian', 'Common', 'Coptic', 'Cuneiform', 'Cypriot', 'Cypro_Minoan', 'Cyrillic', 'Deseret', 'Devanagari', 'Dives_Akuru', 'Dogra', 'Duployan', 'Egyptian_Hieroglyphs', 'Elbasan', 'Elymaic', 'Ethiopic', 'Garay', 'Georgian', 'Glagolitic', 'Gothic', 'Grantha', 'Greek', 'Gujarati', 'Gunjala_Gondi', 'Gurmukhi', 'Gurung_Khema', 'Han', 'Hangul', 'Hanifi_Rohingya', 'Hanunoo', 'Hatran', 'Hebrew', 'Hiragana', 'Imperial_Aramaic', 'Inherited', 'Inscriptional_Pahlavi', 'Inscriptional_Parthian', 'Javanese', 'Kaithi', 'Kannada', 'Katakana', 'Kawi', 'Kayah_Li', 'Kharoshthi', 'Khitan_Small_Script', 'Khmer', 'Khojki', 'Khudawadi', 'Kirat_Rai', 'Lao', 'Latin', 'Lepcha', 'Limbu', 'Linear_A', 'Linear_B', 'Lisu', 'Lycian', 'Lydian', 'Mahajani', 'Makasar', 'Malayalam', 'Mandaic', 'Manichaean', 'Marchen', 'Masaram_Gondi', 'Medefaidrin', 'Meetei_Mayek', 'Mende_Kikakui', 'Meroitic_Cursive', 'Meroitic_Hieroglyphs', 'Miao', 'Modi', 'Mongolian', 'Mro', 'Multani', 'Myanmar', 'Nabataean', 'Nag_Mundari', 'Nandinagari', 'New_Tai_Lue', 'Newa', 'Nko', 'Nushu', 'Nyiakeng_Puachue_Hmong', 'Ogham', 'Ol_Chiki', 'Ol_Onal', 'Old_Hungarian', 'Old_Italic', 'Old_North_Arabian', 'Old_Permic', 'Old_Persian', 'Old_Sogdian', 'Old_South_Arabian', 'Old_Turkic', 'Old_Uyghur', 'Oriya', 'Osage', 'Osmanya', 'Pahawh_Hmong', 'Palmyrene', 'Pau_Cin_Hau', 'Phags_Pa', 'Phoenician', 'Psalter_Pahlavi', 'Rejang', 'Runic', 'Samaritan', 'Saurashtra', 'Sharada', 'Shavian', 'Siddham', 'SignWriting', 'Sinhala', 'Sogdian', 'Sora_Sompeng', 'Soyombo', 'Sundanese', 'Sunuwar', 'Syloti_Nagri', 'Syriac', 'Tagalog', 'Tagbanwa', 'Tai_Le', 'Tai_Tham', 'Tai_Viet', 'Takri', 'Tamil', 'Tangsa', 'Tangut', 'Telugu', 'Thaana', 'Thai', 'Tibetan', 'Tifinagh', 'Tirhuta', 'Todhri', 'Toto', 'Tulu_Tigalari', 'Ugaritic', 'Vai', 'Vithkuqi', 'Wancho', 'Warang_Citi', 'Yezidi', 'Yi', 'Zanabazar_Square'],
//     'Case_Folding': ['C', 'F', 'S', 'T'], 
//     'Block': ['Adlam', 'Aegean_Numbers', 'Ahom', 'Alchemical_Symbols', 'Alphabetic_Presentation_Forms', 'Anatolian_Hieroglyphs', 'Ancient_Greek_Musical_Notation', 'Ancient_Greek_Numbers', 'Ancient_Symbols', 'Arabic', 'Arabic_Extended_A', 'Arabic_Extended_B', 'Arabic_Extended_C', 'Arabic_Mathematical_Alphabetic_Symbols', 'Arabic_Presentation_Forms_A', 'Arabic_Presentation_Forms_B', 'Arabic_Supplement', 'Armenian', 'Arrows', 'Avestan', 'Balinese', 'Bamum', 'Bamum_Supplement', 'Basic_Latin', 'Bassa_Vah', 'Batak', 'Bengali', 'Bhaiksuki', 'Block_Elements', 'Bopomofo', 'Bopomofo_Extended', 'Box_Drawing', 'Brahmi', 'Braille_Patterns', 'Buginese', 'Buhid', 'Byzantine_Musical_Symbols', 'CJK_Compatibility', 'CJK_Compatibility_Forms', 'CJK_Compatibility_Ideographs', 'CJK_Compatibility_Ideographs_Supplement', 'CJK_Radicals_Supplement', 'CJK_Strokes', 'CJK_Symbols_And_Punctuation', 'CJK_Unified_Ideographs', 'CJK_Unified_Ideographs_Extension_A', 'CJK_Unified_Ideographs_Extension_B', 'CJK_Unified_Ideographs_Extension_C', 'CJK_Unified_Ideographs_Extension_D', 'CJK_Unified_Ideographs_Extension_E', 'CJK_Unified_Ideographs_Extension_F', 'CJK_Unified_Ideographs_Extension_G', 'CJK_Unified_Ideographs_Extension_H', 'CJK_Unified_Ideographs_Extension_I', 'Carian', 'Caucasian_Albanian', 'Chakma', 'Cham', 'Cherokee', 'Cherokee_Supplement', 'Chess_Symbols', 'Chorasmian', 'Combining_Diacritical_Marks', 'Combining_Diacritical_Marks_Extended', 'Combining_Diacritical_Marks_For_Symbols', 'Combining_Diacritical_Marks_Supplement', 'Combining_Half_Marks', 'Common_Indic_Number_Forms', 'Control_Pictures', 'Coptic', 'Coptic_Epact_Numbers', 'Counting_Rod_Numerals', 'Cuneiform', 'Cuneiform_Numbers_And_Punctuation', 'Currency_Symbols', 'Cypriot_Syllabary', 'Cypro_Minoan', 'Cyrillic', 'Cyrillic_Extended_A', 'Cyrillic_Extended_B', 'Cyrillic_Extended_C', 'Cyrillic_Extended_D', 'Cyrillic_Supplement', 'Deseret', 'Devanagari', 'Devanagari_Extended', 'Devanagari_Extended_A', 'Dingbats', 'Dives_Akuru', 'Dogra', 'Domino_Tiles', 'Duployan', 'Early_Dynastic_Cuneiform', 'Egyptian_Hieroglyph_Format_Controls', 'Egyptian_Hieroglyphs', 'Egyptian_Hieroglyphs_Extended_A', 'Elbasan', 'Elymaic', 'Emoticons', 'Enclosed_Alphanumeric_Supplement', 'Enclosed_Alphanumerics', 'Enclosed_CJK_Letters_And_Months', 'Enclosed_Ideographic_Supplement', 'Ethiopic', 'Ethiopic_Extended', 'Ethiopic_Extended_A', 'Ethiopic_Extended_B', 'Ethiopic_Supplement', 'Garay', 'General_Punctuation', 'Geometric_Shapes', 'Geometric_Shapes_Extended', 'Georgian', 'Georgian_Extended', 'Georgian_Supplement', 'Glagolitic', 'Glagolitic_Supplement', 'Gothic', 'Grantha', 'Greek_And_Coptic', 'Greek_Extended', 'Gujarati', 'Gunjala_Gondi', 'Gurmukhi', 'Gurung_Khema', 'Halfwidth_And_Fullwidth_Forms', 'Hangul_Compatibility_Jamo', 'Hangul_Jamo', 'Hangul_Jamo_Extended_A', 'Hangul_Jamo_Extended_B', 'Hangul_Syllables', 'Hanifi_Rohingya', 'Hanunoo', 'Hatran', 'Hebrew', 'High_Private_Use_Surrogates', 'High_Surrogates', 'Hiragana', 'IPA_Extensions', 'Ideographic_Description_Characters',
//     'Ideographic_Symbols_And_Punctuation', 'Imperial_Aramaic', 'Indic_Siyaq_Numbers', 'Inscriptional_Pahlavi', 'Inscriptional_Parthian', 'Javanese', 'Kaithi', 'Kaktovik_Numerals', 'Kana_Extended_A', 'Kana_Extended_B', 'Kana_Supplement', 'Kanbun', 'Kangxi_Radicals', 'Kannada', 'Katakana', 'Katakana_Phonetic_Extensions', 'Kawi', 'Kayah_Li', 'Kharoshthi', 'Khitan_Small_Script', 'Khmer', 'Khmer_Symbols', 'Khojki', 'Khudawadi', 'Kirat_Rai', 'Lao', 'Latin_1_Supplement', 'Latin_Extended_A', 'Latin_Extended_Additional', 'Latin_Extended_B', 'Latin_Extended_C', 'Latin_Extended_D', 'Latin_Extended_E', 'Latin_Extended_F', 'Latin_Extended_G', 'Lepcha', 'Letterlike_Symbols', 'Limbu', 'Linear_A', 'Linear_B_Ideograms', 'Linear_B_Syllabary', 'Lisu', 'Lisu_Supplement', 'Low_Surrogates', 'Lycian', 'Lydian', 'Mahajani', 'Mahjong_Tiles', 'Makasar', 'Malayalam', 'Mandaic', 'Manichaean', 'Marchen', 'Masaram_Gondi', 'Mathematical_Alphanumeric_Symbols', 'Mathematical_Operators', 'Mayan_Numerals', 'Medefaidrin', 'Meetei_Mayek', 'Meetei_Mayek_Extensions', 'Mende_Kikakui', 'Meroitic_Cursive', 'Meroitic_Hieroglyphs', 'Miao', 'Miscellaneous_Mathematical_Symbols_A', 'Miscellaneous_Mathematical_Symbols_B', 'Miscellaneous_Symbols', 'Miscellaneous_Symbols_And_Arrows', 'Miscellaneous_Symbols_And_Pictographs', 'Miscellaneous_Technical', 'Modi', 'Modifier_Tone_Letters', 'Mongolian', 'Mongolian_Supplement', 'Mro', 'Multani', 'Musical_Symbols', 'Myanmar', 'Myanmar_Extended_A', 'Myanmar_Extended_B', 'Myanmar_Extended_C', 'NKo', 'Nabataean', 'Nag_Mundari', 'Nandinagari', 'New_Tai_Lue', 'Newa', 'Number_Forms', 'Nushu', 'Nyiakeng_Puachue_Hmong', 'Ogham', 'Ol_Chiki', 'Ol_Onal', 'Old_Hungarian', 'Old_Italic', 'Old_North_Arabian', 'Old_Permic', 'Old_Persian', 'Old_Sogdian', 'Old_South_Arabian', 'Old_Turkic', 'Old_Uyghur', 'Optical_Character_Recognition', 'Oriya', 'Ornamental_Dingbats', 'Osage', 'Osmanya', 'Ottoman_Siyaq_Numbers', 'Pahawh_Hmong', 'Palmyrene', 'Pau_Cin_Hau', 'Phags_Pa', 'Phaistos_Disc', 'Phoenician', 'Phonetic_Extensions', 'Phonetic_Extensions_Supplement', 'Playing_Cards', 'Private_Use_Area', 'Psalter_Pahlavi', 'Rejang', 'Rumi_Numeral_Symbols', 'Runic', 'Samaritan', 'Saurashtra', 'Sharada', 'Shavian', 'Shorthand_Format_Controls', 'Siddham', 'Sinhala', 'Sinhala_Archaic_Numbers', 'Small_Form_Variants', 'Small_Kana_Extension', 'Sogdian', 'Sora_Sompeng', 'Soyombo', 'Spacing_Modifier_Letters', 'Specials', 'Sundanese', 'Sundanese_Supplement', 'Sunuwar', 'Superscripts_And_Subscripts', 'Supplemental_Arrows_A', 'Supplemental_Arrows_B', 'Supplemental_Arrows_C', 'Supplemental_Mathematical_Operators', 'Supplemental_Punctuation', 'Supplemental_Symbols_And_Pictographs', 'Supplementary_Private_Use_Area_A', 'Supplementary_Private_Use_Area_B', 'Sutton_SignWriting', 'Syloti_Nagri', 'Symbols_And_Pictographs_Extended_A', 'Symbols_For_Legacy_Computing', 'Symbols_For_Legacy_Computing_Supplement', 'Syriac', 'Syriac_Supplement', 'Tagalog', 'Tagbanwa', 'Tags', 'Tai_Le', 'Tai_Tham', 'Tai_Viet', 'Tai_Xuan_Jing_Symbols', 'Takri', 'Tamil', 'Tamil_Supplement', 'Tangsa', 'Tangut', 'Tangut_Components', 'Tangut_Supplement', 'Telugu', 'Thaana', 'Thai', 'Tibetan', 'Tifinagh', 'Tirhuta', 'Todhri', 'Toto', 'Transport_And_Map_Symbols', 'Tulu_Tigalari', 'Ugaritic', 'Unified_Canadian_Aboriginal_Syllabics', 'Unified_Canadian_Aboriginal_Syllabics_Extended', 'Unified_Canadian_Aboriginal_Syllabics_Extended_A', 'Vai', 'Variation_Selectors', 'Variation_Selectors_Supplement', 'Vedic_Extensions', 'Vertical_Forms', 'Vithkuqi', 'Wancho', 'Warang_Citi', 'Yezidi', 'Yi_Radicals', 'Yi_Syllables', 'Yijing_Hexagram_Symbols', 'Zanabazar_Square', 'Znamenny_Musical_Notation'],

//     'Bidi_Mirroring_Glyph': [], 
//     'Bidi_Paired_Bracket_Type': ['Close', 'None', 'Open'], 
//     'Line_Break': ['Aksara', 'Aksara_Prebase', 'Aksara_Start', 'Alphabetic', 'Ambiguous', 'Break_After', 'Break_Before', 'Break_Both', 'Break_Symbols', 'Carriage_Return', 'Close_Parenthesis', 'Close_Punctuation', 'Combining_Mark', 'Complex_Context', 'Conditional_Japanese_Starter', 'Contingent_Break', 'E_Base', 'E_Modifier', 'Exclamation', 'Glue', 'H2', 'H3', 'Hebrew_Letter', 'Hyphen', 'Ideographic', 'Infix_Numeric', 'Inseparable', 'JL', 'JT', 'JV', 'Line_Feed', 'Mandatory_Break', 'Next_Line', 'Nonstarter', 'Numeric', 'Open_Punctuation', 'Postfix_Numeric', 'Prefix_Numeric', 'Quotation', 'Regional_Indicator', 'Space', 'Surrogate', 'Unknown', 'Virama', 'Virama_Final', 'Word_Joiner', 'ZWJ', 'ZWSpace'],
//     'Word_Break': ['ALetter', 'CR', 'Double_Quote', 'Extend', 'ExtendNumLet', 'Format', 'Hebrew_Letter', 'Katakana', 'LF', 'MidLetter', 'MidNum', 'MidNumLet', 'Newline', 'Numeric', 'Other', 'Regional_Indicator', 'Single_Quote', 'WSegSpace', 'ZWJ'],
//     'Sequence_Property': ['Basic_Emoji', 'Emoji_Keycap_Sequence', 'Emoji_Test', 'RGI_Emoji', 'RGI_Emoji_Flag_Sequence', 'RGI_Emoji_Modifier_Sequence', 'RGI_Emoji_Tag_Sequence', 'RGI_Emoji_ZWJ_Sequence'],
//     'Names': ['Abbreviation', 'Alternate', 'Control', 'Correction', 'Figment'],
//     'Simple_Case_Mapping': ['Lowercase', 'Titlecase', 'Uppercase'], 
//     'Special_Casing': ['Lowercase', 'Lowercase--Final_Sigma', 'Lowercase--az', 'Lowercase--az--After_I', 'Lowercase--az--Not_Before_Dot', 'Lowercase--lt', 'Lowercase--lt--After_Soft_Dotted', 'Lowercase--lt--More_Above', 'Lowercase--tr', 'Lowercase--tr--After_I', 'Lowercase--tr--Not_Before_Dot', 'Titlecase', 'Titlecase--Final_Sigma', 'Titlecase--az', 'Titlecase--az--After_I', 'Titlecase--az--Not_Before_Dot', 'Titlecase--lt', 'Titlecase--lt--After_Soft_Dotted', 'Titlecase--lt--More_Above', 'Titlecase--tr', 'Titlecase--tr--After_I', 'Titlecase--tr--Not_Before_Dot', 'Uppercase', 'Uppercase--Final_Sigma', 'Uppercase--az', 'Uppercase--az--After_I', 'Uppercase--az--Not_Before_Dot', 'Uppercase--lt', 'Uppercase--lt--After_Soft_Dotted', 'Uppercase--lt--More_Above', 'Uppercase--tr', 'Uppercase--tr--After_I', 'Uppercase--tr--Not_Before_Dot']
// }