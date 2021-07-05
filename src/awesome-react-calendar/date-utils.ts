/* eslint-disable no-loop-func */
import type {
  MonthIndices,
  WeekdayIndices,
  MonthCell,
  YearCell,
  DateParts,
  DayOfMonthCell,
  GetDaysOfMonthViewMetrixParams,
  CheckIfDateIsDisabledHOFParams,
} from './types';

import { NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP } from './constants';

/**
 * Returns true if the given date is valid
 */
export function isValid(date: unknown): date is Date {
  return typeof date !== 'undefined' && date !== null && !isNaN(new Date(date as Date).getTime());
}

/**
 * Returns true if the given dates are equal
 */
export function isEqual(first: DateParts, second: DateParts): boolean {
  return first.year === second.year && first.month === second.month && first.monthDate === second.monthDate;
}

/**
 * Returns true if the given date falls inside the range
 */
export function isPartOfRange(rangeStart: DateParts, rangeEnd: DateParts, date: DateParts): boolean {
  // if date lies in between the year
  if (rangeStart.year <= date.year && date.year <= rangeEnd.year) {
    // if year is in-between range year start and year end
    if (rangeStart.year < date.year && date.year < rangeEnd.year) {
      return true;
    }

    // if start year and end year are same
    if (rangeStart.year === rangeEnd.year) {
      if (rangeStart.month <= date.month && date.month <= rangeEnd.month) {
        // if month is in-between month start and and moth end
        if (rangeStart.month < date.month && date.month < rangeEnd.month) {
          return true;
        }

        // if month start and month end are same
        if (rangeStart.month === rangeEnd.month) {
          if (
            rangeStart.monthDate <= date.monthDate &&
            date.monthDate <= rangeEnd.monthDate &&
            date.month === rangeEnd.month
          ) {
            return true;
          }
          return false;
        }

        // if date is in start month
        if (rangeStart.month === date.month) {
          if (rangeStart.monthDate <= date.monthDate) {
            return true;
          }
          return false;
        }

        // if date is in end month
        if (rangeEnd.month === date.month) {
          if (date.monthDate <= rangeEnd.monthDate) {
            return true;
          }
          return false;
        }

        return false;
      }
      return false;
    }

    // if year is same as start year
    if (rangeStart.year === date.year) {
      // if month is greater than start month
      if (date.month > rangeStart.month) {
        return true;
      }

      // if month is same as start month
      if (date.month === rangeStart.month) {
        // if date is greater than range start date
        if (date.monthDate >= rangeStart.monthDate) {
          return true;
        }
      }

      return false;
    }

    // if year is same as end year
    if (rangeEnd.year === date.year) {
      // if month is smaller than end month
      if (date.month < rangeEnd.month) {
        return true;
      }

      // if month is same as end month
      if (date.month === rangeEnd.month) {
        // if date is smaller than range end date
        if (date.monthDate <= rangeEnd.monthDate) {
          return true;
        }
      }
      return false;
    }

    return false;
  }
  return false;
}

/**
 * Returns true if the given year is a leap year.
 * @param {number} year
 */
export function isALeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in the given month of the given year.
 * @param {number} year
 * @param {number} month
 */
export function getNumberOfDaysInAMonth(year: number, month: MonthIndices) {
  const map: Record<MonthIndices, number> = {
    0: 31,
    1: isALeapYear(year) ? 29 : 28,
    2: 31,
    3: 30,
    4: 31,
    5: 30,
    6: 31,
    7: 31,
    8: 30,
    9: 31,
    10: 30,
    11: 31,
  };

  return map[month];
}

// WEEKDAY UTILS

/**
 * Creates and return a new weekday index-label map as per the **start**
 * parameter. By default this will return the same weekday index-label map
 * used by the Date object.
 * 0 means Sun - if we follow the native Date convention
 * Now if someone wants to start their week from Mon, then 0 would mean Monday which is different from
 * the convention used by the Date methods.
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
export function getWeekDaysIndexToLabelMapForAStartOfTheWeek(startOfTheWeek = 0): Record<WeekdayIndices, string> {
  // we break [0,1,2,3,4,5,6] in two parts, startOfTheWeek = 3
  // [startOfTheWeek,4,5,6] and [0,1,2] and join them with their labels
  // this is just to re-order the label in the **correct order**
  // i.e 0 becomes Wed although in native order 0 is Sunday
  return Object.keys(NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP)
    .slice(startOfTheWeek, 7)
    .concat(Object.keys(NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP).slice(0, startOfTheWeek))
    .reduce((acc, weekdayIndex, index) => {
      // acc[0] = DEFAULT_WEEKDAY_INDEX[3]
      acc[Number(index) as WeekdayIndices] = NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP[Number(weekdayIndex) as WeekdayIndices];
      return acc;
    }, {} as Record<WeekdayIndices, string>);
}

/**
 * So if the Date object says that some date has 3 day-of-the-week. No this 3 means Wednesday as per the native index for week days.
 * But if a calendar starts from Monday, then wednesday will not be at 3 but it will be at some other index which is according to a different index-label map.
 * So this method returns that index for wednesday.
 * @param weekdayAsPerNativeIndex day-of-the-week as per the Date object
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getInfluencedWeekDayIndexAsPerAStartDay(weekdayAsPerNativeIndex: number, startOfTheWeek = 0): WeekdayIndices {
  return (
    weekdayAsPerNativeIndex >= startOfTheWeek
      ? weekdayAsPerNativeIndex - startOfTheWeek
      : 6 - startOfTheWeek + 1 + weekdayAsPerNativeIndex
  ) as WeekdayIndices;
}

// {
//   0: 'Mo',
//   1: 'Tu',
//   2: 'We',
//   3: 'Th',
//   4: 'Fr',
//   5: 'Sa',
//   6: 'Su'
// };
// start = 1
// 6 - 1 = 5
// influencedIndex = 3 (Thu)
// 3 <= 5 so 3 + 1 = 4 (Thu) (native)
// influencedIndex = 2 (Wed)
// 2 <= 5 so 2 + 1 = 3 (Wed) (native)
// influencedIndex = 5 (Sa)
// 5 <= 5 so 5 + 1 = 6 (Sa) (native)
// influencedIndex = 6 (Su)
// 6 > 5 so ((6 - 5) - 1) = 0 (su) (native)

// {
//   0: 'Tu',
//   1: 'We',
//   2: 'Th',
//   3: 'Fr',
//   4: 'Sa',
//   5: 'Su',
//   6: 'Mo'
// };
// start = 2
// 6 - 2 = 4
// influencedIndex = 3 (Fr)
// 3 <= 4 so 3 + 2 = 5 (Fr) (native)
// influencedIndex = 2 (Th)
// 2 <= 4 so 2 + 2 = 4 (Th) (native)
// influencedIndex = 5 (Su)
// 5 > 4 so ((5 - 4) - 1) = 0 (Su) (native)
// influencedIndex = 6 (Mo)
// 6 > 4 so ((6 - 4) - 1) = 1 (Mo) (native)
function getNativeWeekDayIndexFromAStartDayInfluencedIndex(
  weekdayAsPerChangedIndex: number,
  startOfTheWeek: number
): WeekdayIndices {
  const diversion = 6 - startOfTheWeek;
  return (
    weekdayAsPerChangedIndex <= diversion
      ? weekdayAsPerChangedIndex + startOfTheWeek
      : weekdayAsPerChangedIndex - diversion - 1
  ) as WeekdayIndices;
}

/**
 * Gives the index of day-of-the-week on the 1st of the provided month-year.
 * @param year Specify a year
 * @param month Specify a month
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getInfluencedWeekDayIndexOnFirstDateOfMonth(
  year: number,
  month: number,
  startOfTheWeek: number
): WeekdayIndices {
  const date = new Date();
  date.setDate(1);
  date.setMonth(month);
  date.setFullYear(year);
  return getInfluencedWeekDayIndexAsPerAStartDay(date.getDay(), startOfTheWeek) as WeekdayIndices;
}

/**
 * Returns info about what indexes are weekend
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getWeekendInfo(startOfTheWeek: number): {
  weekend: WeekdayIndices[];
  saturday: WeekdayIndices;
  sunday: WeekdayIndices;
} {
  if (startOfTheWeek === 0) {
    return { weekend: [6, 0], saturday: 6, sunday: 0 };
  } else if (startOfTheWeek === 1) {
    return { weekend: [5, 6], saturday: 5, sunday: 6 };
  } else if (startOfTheWeek === 2) {
    return { weekend: [4, 5], saturday: 4, sunday: 5 };
  } else if (startOfTheWeek === 3) {
    return { weekend: [3, 4], saturday: 3, sunday: 4 };
  } else if (startOfTheWeek === 4) {
    return { weekend: [2, 3], saturday: 2, sunday: 3 };
  } else if (startOfTheWeek === 5) {
    return { weekend: [1, 2], saturday: 1, sunday: 2 };
  } else {
    return { weekend: [0, 1], saturday: 0, sunday: 1 };
  }
}

export function getPreviousMonth(month: MonthIndices): MonthIndices {
  return month === 0 ? 11 : ((month - 1) as MonthIndices);
}

export function getNextMonth(month: MonthIndices): MonthIndices {
  return month === 11 ? 0 : ((month + 1) as MonthIndices);
}

export function getPreviousYear(year: number): number {
  return year === 1 ? 1 : year - 1;
}

export function getNextYear(year: number): number {
  return year + 1;
}

// 1 - 20 (20 years in one range block)
// 21 - 40
// so if you provide 3 then the start of raange for 3 would be
// 1 since it belongs to the 1-20 year range.
export function getStartOfRangeForAYear(year: number) {
  // last cell will always be a perfect multiple of 20
  // take 2016 as an example
  if (year % 20 === 0) {
    return 20 * (year / 20 - 1) + 1;
  }
  // logic derived from a few examples like 2021, 1981, 1973
  return 20 * Number((year / 20).toFixed(0)) + 1;
}

/**
 * Returns matrix for the month select view.
 * @param selectedMonth
 */
export function getMonthViewMetrix(selectedMonth: number): Array<MonthCell>[] {
  const months = Array.from({ length: 12 }, (v, k) => {
    return {
      month: k as MonthIndices,
      isCurrentMonth: new Date().getMonth() === k,
      isSelectedMonth: selectedMonth === k,
    };
  });
  return [months.slice(0, 3), months.slice(3, 6), months.slice(6, 9), months.slice(9, 12)];
}

export function getPreviousRangeStartingYear(rangeStartYear: number) {
  if (rangeStartYear === 1) {
    return 1;
  }
  return getStartOfRangeForAYear(rangeStartYear - 1);
}

export function getNextRangeStartingYear(rangeStartYear: number) {
  return getStartOfRangeForAYear(rangeStartYear + 20);
}

export function getYearRangeLimits(rangeStartYear: number) {
  return [rangeStartYear, rangeStartYear + 19];
}

export function getYearsViewMetrix(rangeStartYear: number, selectedYear: number): Array<YearCell>[] {
  const years = Array.from({ length: 20 }, (v, index) => {
    return {
      year: rangeStartYear + index,
      isCurrentYear: new Date().getFullYear() === rangeStartYear + index,
      isSelectedYear: selectedYear === rangeStartYear + index,
    };
  });
  return [years.slice(0, 5), years.slice(5, 10), years.slice(10, 15), years.slice(15, 20)];
}

export function validateAndReturnDateFormatter(format: string) {
  const partsMap: Record<'YYYY' | 'MM' | 'DD', boolean> = { YYYY: true, MM: true, DD: true };
  const parts = format.split('-') as ('YYYY' | 'MM' | 'DD')[];
  if (parts.length !== 3) {
    throw new Error('Date format is invalid.');
  }
  if (!parts.every((part) => partsMap[part])) {
    throw new Error('Date format uses unknown parts.');
  }
  return (year: number, month: number, date: number, separator: string): string => {
    let string = '';
    parts.forEach((part, index) => {
      if (part === 'YYYY') {
        string += year;
      }
      if (part === 'MM') {
        string += month;
      }
      if (part === 'DD') {
        string += date;
      }
      if (index !== 2) {
        string += separator;
      }
    });
    return string;
  };
}

function checkIfDateIsDisabledHOF(params: CheckIfDateIsDisabledHOFParams) {
  const { disablePast, disableToday, disableFuture, customDisabledCheck } = params;

  const date = new Date();
  const dayOfMonth = date.getDate();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  return function checkIfDateIsDisabled(year: number, month: MonthIndices, date: number, weekday: WeekdayIndices) {
    if (disablePast) {
      if (year < currentYear) {
        return true;
      }

      if (year === currentYear && month < currentMonth) {
        return true;
      }

      if (year === currentYear && month === currentMonth && date < dayOfMonth) {
        return true;
      }
    }
    if (disableToday) {
      if (year === currentYear && month === currentMonth && date === dayOfMonth) {
        return true;
      }
    }
    if (disableFuture) {
      if (year > currentYear) {
        return true;
      }

      if (year === currentYear && month > currentMonth) {
        return true;
      }

      if (year === currentYear && month === currentMonth && date > dayOfMonth) {
        return true;
      }
    }

    if (typeof customDisabledCheck === 'function') {
      return customDisabledCheck({
        year: year,
        month: month,
        weekday: weekday,
        date: date,
      });
    }

    return false;
  };
}

export function getDaysOfMonthViewMetrix(params: GetDaysOfMonthViewMetrixParams): Array<DayOfMonthCell>[] {
  const {
    isRangeView,
    selectedEndDayOfMonth,
    selectedEndMonth,
    selectedEndYear,
    selectedStartDayOfMonth,
    selectedStartMonth,
    selectedStartYear,
    yearInView,
    monthInView,
    startOfTheWeek,
    selectedYear,
    selectedMonth,
    selectedDayOfMonth,
    disableFuture = false,
    disablePast = false,
    disableToday = false,
    isDisabled,
  } = params;

  const matrix: Array<DayOfMonthCell>[] = [[], [], [], [], [], []];

  const currentMonthDatesStartIndex = getInfluencedWeekDayIndexOnFirstDateOfMonth(
    yearInView,
    monthInView,
    startOfTheWeek
  );

  const weekends = getWeekendInfo(startOfTheWeek);

  const checkDisabledForADate = checkIfDateIsDisabledHOF({
    disablePast,
    disableToday,
    disableFuture,
    customDisabledCheck: isDisabled,
  });

  const todaysDate = new Date().getDate();
  const todaysMonth = new Date().getMonth();
  const todaysYear = new Date().getFullYear();
  const totalDaysInCurrentMonth = getNumberOfDaysInAMonth(yearInView, monthInView);

  const isPrevMonthFromLastYear = monthInView === 0;
  const isCurrentMonthLast = monthInView === 11;

  const totalDaysInPrevMonth = getNumberOfDaysInAMonth(
    isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView,
    getPreviousMonth(monthInView)
  );

  // calendar has 6 rows (0 - 5)
  let row = 0;
  let weekColumn: WeekdayIndices = 0;

  //  31 - (6 - 1) === 26
  const lastMonthDateStartFrom = totalDaysInPrevMonth - (currentMonthDatesStartIndex - 1);

  // first loop to fill cell values of last month
  for (let date = lastMonthDateStartFrom; date <= totalDaysInPrevMonth; date++) {
    if (weekColumn === 7) {
      weekColumn = 0;
      row++;
    }
    const currMonth = getPreviousMonth(monthInView);
    const currYear = isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView;
    matrix[row].push({
      date: date,
      month: currMonth,
      activeMonthInView: false,
      isInRange: isRangeView
        ? isPartOfRange(
            { month: selectedStartMonth, year: selectedStartYear, monthDate: selectedStartDayOfMonth },
            { month: selectedEndMonth, year: selectedEndYear, monthDate: selectedEndDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      isRangeStart: isRangeView
        ? isEqual(
            { month: selectedStartMonth, year: selectedStartYear, monthDate: selectedStartDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      isRangeEnd: isRangeView
        ? isEqual(
            { month: selectedEndMonth, year: selectedEndYear, monthDate: selectedEndDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      year: currYear,
      isWeekend: typeof weekends.weekend.find((c) => c === weekColumn) === 'number' ? true : false,
      isSat: weekends.saturday === weekColumn,
      isSun: weekends.sunday === weekColumn,
      dayOfWeek: getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek),
      isToday: date === todaysDate && currMonth === todaysMonth && currYear === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: weekColumn === 0,
      isLastColumn: weekColumn === 6,
      isSelected: currMonth === selectedMonth && currYear === selectedYear && date === selectedDayOfMonth,
      // not modified
      isDisabled: checkDisabledForADate(
        currYear,
        currMonth,
        date,
        getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek)
      ),
    });
    weekColumn++;
  }

  // second loop to fill cell values of current month
  for (let date = 1; date <= totalDaysInCurrentMonth; date++) {
    if (weekColumn === 7) {
      weekColumn = 0;
      row++;
    }
    const currMonth = monthInView;
    const currYear = yearInView;
    const isToday = date === todaysDate && monthInView === todaysMonth && yearInView === todaysYear;
    matrix[row].push({
      date: date,
      month: currMonth,
      activeMonthInView: true,
      isInRange: isRangeView
        ? isPartOfRange(
            { month: selectedStartMonth, year: selectedStartYear, monthDate: selectedStartDayOfMonth },
            { month: selectedEndMonth, year: selectedEndYear, monthDate: selectedEndDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      isRangeStart: isRangeView
        ? isEqual(
            { month: selectedStartMonth, year: selectedStartYear, monthDate: selectedStartDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      isRangeEnd: isRangeView
        ? isEqual(
            { month: selectedEndMonth, year: selectedEndYear, monthDate: selectedEndDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      year: currYear,
      dayOfWeek: getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek),
      isWeekend: typeof weekends.weekend.find((c) => c === weekColumn) === 'number' ? true : false,
      isSat: weekends.saturday === weekColumn,
      isSun: weekends.sunday === weekColumn,
      isToday: isToday,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: weekColumn === 0,
      isLastColumn: weekColumn === 6,
      isSelected: currMonth === selectedMonth && currYear === selectedYear && date === selectedDayOfMonth,
      isDisabled: checkDisabledForADate(
        currYear,
        currMonth,
        date,
        getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek)
      ),
    });
    weekColumn++;
  }

  let date = 1;
  // last loop to fill cell values of next month

  while (matrix[5].length < 7) {
    if (weekColumn === 7) {
      weekColumn = 0;
      row++;
    }
    const currMonth = getNextMonth(monthInView);
    const currYear = isCurrentMonthLast ? yearInView + 1 : yearInView;
    matrix[row].push({
      date: date,
      month: currMonth,
      activeMonthInView: false,
      isInRange: isRangeView
        ? isPartOfRange(
            { month: selectedStartMonth, year: selectedStartYear, monthDate: selectedStartDayOfMonth },
            { month: selectedEndMonth, year: selectedEndYear, monthDate: selectedEndDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      isRangeStart: isRangeView
        ? isEqual(
            { month: selectedStartMonth, year: selectedStartYear, monthDate: selectedStartDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      isRangeEnd: isRangeView
        ? isEqual(
            { month: selectedEndMonth, year: selectedEndYear, monthDate: selectedEndDayOfMonth },
            { month: currMonth, year: currYear, monthDate: date }
          )
        : false,
      year: currYear,
      dayOfWeek: getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek),
      isWeekend: typeof weekends.weekend.find((c) => c === weekColumn) === 'number' ? true : false,
      isSat: weekends.saturday === weekColumn,
      isSun: weekends.sunday === weekColumn,
      isToday: date === todaysDate && currMonth === todaysMonth && currYear === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: weekColumn === 0,
      isLastColumn: weekColumn === 6,
      isSelected: currMonth === selectedMonth && currYear === selectedYear && date === selectedDayOfMonth,
      isDisabled: checkDisabledForADate(
        currYear,
        currMonth,
        date,
        getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek)
      ),
    });
    weekColumn++;
    date++;
  }

  return matrix;
}
