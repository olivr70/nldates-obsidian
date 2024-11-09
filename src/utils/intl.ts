// ONLY MODULES DEPENDANCIES

// return an array of month names for a locale
export function getIntlMonthNames(locale:string, format: "long" | "short" | "narrow" |"numeric" | "2-digit") {
    const formatter = new Intl.DateTimeFormat(locale, { month: format });
    const months = [];
    for (let month = 0; month < 12; month++) {
        const date = new Date(2020, month, 1); // Using a fixed year and day
        months.push(formatter.format(date));
    }
    return months;
  };

  /**
   * 
   * @returns the IANA name for the timzone of the user
   */
  export function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  /** builds a Dictionnary of day names to day numbers for a locale */
  export function getIntlWeekdayNames(locale:string, format: "long" | "short" | "narrow") {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
    const weekdays = [];
    for (let day = 0; day < 7; day++) {
        // 2024.01.07 is a sunday
        const date = new Date(2024, 0, 7 + day); // Using a fixed year and month, starting from Thursday
        weekdays.push(formatter.format(date));
    }
    return weekdays;
  };

  /** Compute the UTC offset string for ianaZone on a specific
   * 
   * @param ianaZone defaults to getUserTimezone()
   * @param when  defaults to now
   * @returns the timezone offset string, in formet "+04:00" or ("-06:45")
   */
  export function timezoneOffset(ianaZone:string = getUserTimezone(), when:Date = new Date()):string {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: "longOffset", // timezone will be like "GMT+02:00" or "GMT-04:30"
    })
    const zone = fmt.formatToParts(when).find((x) => x.type == "timeZoneName")?.value;
    const match = /([-+])(\d\d):(\d\d)/i.exec(zone);
    if (!match) { throw new Error(`longOffset format for ${ianaZone} does not have the expected format : ${zone}`) }
    return match[0]
  }