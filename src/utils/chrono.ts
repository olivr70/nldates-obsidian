import { ParsedResult } from "chrono-node";
import { compare, compareReverseWithLt } from "./regex";



/** orders results by ascending index, and descending length */
export function compareParseResult(a:ParsedResult, b:ParsedResult):-1|0|1 {
  let res = compare(a.index, b.index)
  if (res == 0) {
    res = compareReverseWithLt(a.text.length, b.text.length)
  }
  return res;
}