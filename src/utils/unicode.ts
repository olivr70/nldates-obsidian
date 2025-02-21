

export function splitIntoCodePoints(str: string): string[] { 
    const codePoints: string[] = []; 
    for (const char of str) { codePoints.push(char); } 
    return codePoints; 
  }

/** returns the substring using codepoint indexes
 * 
 * The fucnction makes not allocation other than the call to substring()
 * It makes a single iteration on the source string, and as soon as it hits the 
 * expected index.
 * 
 * @returns a substring properly aligned on codepoints
 */
  export function substringCp(text:string, cpStart?:number, cpEnd?:number) {
    const charPositions = codepointsToChars(text, cpStart, cpEnd)
    return text.substring(charPositions[0], charPositions[1])
  }

  /** returns the number of codepoint in text
   * 
   * It is O(n), as it completely iterates on text
   */
export function lengthCp(text:string) {
    let length= 0;
    for (let i = 0; i < text.length;++i) {
        if (!isLowSurrogate(text[i])) length++
    }
    return length;
}


  /** returns the codepoint index at the specified character position */
  export function charToCodepoint(text:string, charIndex:number) {
    let result= 0
    if (charIndex > text.length) return -1
    for (let pos = 0; pos < charIndex; ++pos) {
      if (!isHighSurrogate(text[pos])) result++;
    }
    return result;
  }

  /** returns the char index of the specified codepoint
   * 
   * @returns -1 if codepointIndex if after
   */
  export function codepointToChar(text:string, codepointIndex:number) {
    let cpIndex= 0
    for (let pos = 0; (pos < text.length); ++pos) {
      if (cpIndex == codepointIndex) return pos;
      if (!isHighSurrogate(text[pos])) cpIndex++;
    }
    return -1;
  }

/** returns the char index ot both codepoints
 * 
 * @returns -1 if codepointIndex if after
 */
export function codepointsToChars(text:string, codepointIndex1:number, codepointIndex2:number):[number,number] {
    let cpIndex= 0
    let result:[number,number] = [undefined,undefined]
    let expectedCount = Number(codepointIndex1 != undefined) + Number(codepointIndex2 != undefined);
    for (let pos = 0; (expectedCount != 0) && (pos < text.length); ++pos) {
        if (cpIndex == codepointIndex1 && result[0] === undefined) {result[0] = pos; expectedCount-- }
        if (cpIndex == codepointIndex2 && result[1] === undefined) {result[1] = pos; expectedCount-- }
        if (!isHighSurrogate(text[pos])) cpIndex++;
    }
    return result;
    }

export function isCombiningMark(char: string): boolean {
    const codePoint = char.codePointAt(0);
    return (
        (codePoint! >= 0x0300 && codePoint! <= 0x036F) || // Combining Diacritical Marks
        (codePoint! >= 0x1AB0 && codePoint! <= 0x1AFF) || // Combining Diacritical Marks Extended
        (codePoint! >= 0x1DC0 && codePoint! <= 0x1DFF) || // Combining Diacritical Marks Supplement
        (codePoint! >= 0x20D0 && codePoint! <= 0x20FF) || // Combining Diacritical Marks for Symbols
        (codePoint! >= 0xFE20 && codePoint! <= 0xFE2F)    // Combining Half Marks
    );
}

/** returns true if char is a high surrogate */
export function isHighSurrogate(char: string): boolean {
    const codePoint = char.charCodeAt(0);
    return codePoint >= 0xD800 && codePoint <= 0xDBFF;
}

/** returns true if char is a low surrogate */
export function isLowSurrogate(char: string): boolean {
    const codePoint = char.charCodeAt(0);
    return codePoint >= 0xDC00 && codePoint <= 0xDFFF;
}