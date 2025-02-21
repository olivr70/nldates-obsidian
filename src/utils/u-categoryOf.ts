// WARNING : Automatically generated - do not modify
// Generated on Sun Jan 19 2025 09:30:09 GMT+0100 (heure normale d’Europe centrale)
import UnicodeTrie from 'unicode-trie'; 

const TRIE_DATA = [
	"AAAAAAAAAAAQJAAAe3vckKvBQMDl4tFTRd6np8gpu5+/GGPwgDEo4kltBc9k9yOhUTu9z+2/zMQAAdnH",
	"fr6yn/jlKwMA",
];

const TRIE_VALUES = [
	"Cased_Letter",
	"Close_Punctuation",
	"Connector_Punctuation",
	"Control",
	"Currency_Symbol",
	"Dash_Punctuation",
	"Decimal_Number",
	"Enclosing_Mark",
	"Final_Punctuation",
	"Format",
	"Initial_Punctuation",
	"Letter",
	"Letter_Number",
	"Line_Separator",
	"Lowercase_Letter",
	"Mark",
	"Math_Symbol",
	"Modifier_Letter",
	"Modifier_Symbol",
	"Nonspacing_Mark",
	"Number",
	"Open_Punctuation",
	"Other",
	"Other_Letter",
	"Other_Number",
	"Other_Punctuation",
	"Other_Symbol",
	"Paragraph_Separator",
	"Private_Use",
	"Punctuation",
	"Separator",
	"Space_Separator",
	"Spacing_Mark",
	"Surrogate",
	"Symbol",
	"Titlecase_Letter",
	"Unassigned",
	"Uppercase_Letter",
];

const buf = Buffer.from(TRIE_DATA.join(''), 'base64')

const TRIE = new UnicodeTrie(buf);



export function categoryOf(someChar:string) {  return TRIE_VALUES[TRIE.get(someChar.codePointAt(0))]}