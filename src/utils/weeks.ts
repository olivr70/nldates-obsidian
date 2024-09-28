

export function toIsoWeekDay(dayInWeekJs:number) {
    return (dayInWeekJs + 6) % 7;
}


export function getISOWeekNumber(date:Date):[number,number] {
    const tempDate = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    tempDate.setDate(tempDate.getDate() - dayNumber + 3);
    if (tempDate.getFullYear() < date.getFullYear()) {
        return getISOWeekNumber(tempDate)
    } else if (tempDate.getFullYear() > date.getFullYear()) {
        return [date.getFullYear() + 1, 1]
    } else {
        const firstThursday = tempDate.valueOf();
        tempDate.setMonth(0, 1);
        if (tempDate.getDay() !== 4) {
            tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
        }
        return [date.getFullYear(), 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000)];
    }
}