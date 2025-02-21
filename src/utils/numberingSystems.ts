import { splitIntoCodePoints } from "./unicode";


export type NumberingSystem = 
  "arab" | "beng" | "deva" | "latn" | 
  "mathbold" | "mathsanb" | "mathsans" | "tibt" | "thai";

export const NumSystemDigits = {
  "arab": splitIntoCodePoints("٠١٢٣٤٥٦٧٨٩"),
  "beng": splitIntoCodePoints("০১২৩৪৫৬৭৮৯"),
  "deva": splitIntoCodePoints("०१२३४५६७८९"),
  "latn": splitIntoCodePoints("0123456789"),
  "mathbold": splitIntoCodePoints("𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"),
  "mathsanb": splitIntoCodePoints("𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"),
  "mathsans": splitIntoCodePoints("𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫"),
  "tibt": splitIntoCodePoints("༠༡༢༣༤༥༦༧༨༩"),
  "thai": splitIntoCodePoints("๐๑๒๓๔๕๖๗๘๙")
} 

export function isNumberingSystem(some:string): some is NumberingSystem {
  return NumSystemDigits.hasOwnProperty(some);
}

export function digitsForSystem(system:NumberingSystem):string[] {
  return NumSystemDigits[system];
}

/** returns a Regexp for an integer number in the numbering system */
export function intRegexp(system:NumberingSystem, count?:number) {
  const d = digitsForSystem(system)
  const suffix = (count === undefined ? "+" : `{${count}}`)
  return d && `[${d.join('')}]${suffix}`
}

/** creates and return a integer parsing function */
export function intParserForSystem(system:NumberingSystem): (s:string) => number {
  if (system == "latn") return parseInt
  const zero = NumSystemDigits[system]?.[0].codePointAt(0);
  return (s:string) => intValueOf(s, zero)
}

/** computes the integer value of a string, using the reference of the Zero codepoint */
function intValueOf(s:string, zeroChar:number):number {
  let value = 0
  let count = 0
  for (let codePoint of s) {
    count++;
    let digit = codePoint.codePointAt(0) - zeroChar
    // break on first non digit
    if (digit < 0 || digit > 9) { break; }
    // add digit to result
    value = value * 10 + digit;
  }
  return count ? value : NaN;
}

/** retourne tous les ssytèmes de numération, sauf le Latin (latn) */
function allNumberingSystemButLatin():NumberingSystem[] {
  const result = Object.getOwnPropertyNames(NumSystemDigits)
  result.splice(result.indexOf("latn"), 1)
  return result as NumberingSystem[];
}

/** retourne une Regexp qui match tous les équivalent de val dans les différentes systèmes de numération */
function latinEquivalents(val:number):RegExp {
  const eq = allNumberingSystemButLatin().map(
    (ns) => NumSystemDigits[ns][val]
  )
  const res= new RegExp("[" + eq.join('') + "]", "ug")
  return res
}

const LATIN_DIGITS = NumSystemDigits.latn.map(x => latinEquivalents(parseInt(x)))
  
/** replace all digits in other numeric systems with latin equivalents */
export function makeDigitsLatin(some:string) {
  let result = some;
  for (let i = 0; i < 10; ++i) {
    result = result.replace(LATIN_DIGITS[i], `${i}`)
  }
  return result;
}
