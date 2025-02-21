import { Component } from "chrono-node";
import dayjs, { Dayjs } from "dayjs";
import { DateComponents } from "../types"


  /** computes the date of the previous Day, from ref */
  export function previousDay(daynum:number, refDate = dayjs()):Dayjs {
    const diff = (refDate.day() - daynum + 8) % 7;
    return refDate.subtract(diff)
  }
  
  /** computes the date of the next occuring occuring Day, from ref */
  export function followingDay(daynum:number, refDate = dayjs()):Dayjs {
    const diff = (refDate.day() - daynum + 8) % 7;
    return refDate.add(diff)
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
