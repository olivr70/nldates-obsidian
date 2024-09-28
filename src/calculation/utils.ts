import { Component } from "chrono-node";
import dayjs, { Dayjs } from "dayjs";
import { DateComponents } from "../types"


  
  export function previousDay(daynum:number, ref = dayjs()):Dayjs {
    const diff = (ref.day() - daynum + 8) % 7;
    return ref.subtract(diff)
  }
  
  export function followingDay(daynum:number, ref = dayjs()):Dayjs {
    const diff = (ref.day() - daynum + 8) % 7;
    return ref.add(diff)
  }
  
  export function dateToComponents(date:Dayjs): DateComponents {
    return { year: date.year(), month: date.month(), day: date.daysInMonth() }
  }
  
  export function timeToComponents(date:Dayjs): { [c in Component]? : number } {
    return { hour: date.hour(), minute: date.minute(), second: date.second() }
  }
  
  export function dateTimeToComponents(date:Dayjs): { [c in Component]? : number } {
    return { year: date.year(), month: date.month(), day: date.daysInMonth() }
  }
  
  export function parseOrdinalNumberPattern(ordinals:{[k:string]:number},match: string): number {
    let num = match.toLowerCase();
    if (  ordinals[num] !== undefined) {
      return   ordinals[num];
    }
    return NaN;
  }
