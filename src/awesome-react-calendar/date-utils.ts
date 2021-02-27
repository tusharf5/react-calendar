/* eslint-disable no-loop-func */
import type { MonthIndices, WeekdayIndices, IsDisabledParams, MonthCell, YearCell, DayOfMonthCell } from './types';

import { NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP } from './constants';

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
export function getDaysInMonth(year: number, month: MonthIndices) {
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
  // we break the [0,1,2,3,4,5,6] in two parts
  // [start,4,5,6] and [0,1,2] and join them with their labels
  // this is just to re-order the label in the **correct order**
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
  return (weekdayAsPerNativeIndex >= startOfTheWeek
    ? weekdayAsPerNativeIndex - startOfTheWeek
    : 6 - startOfTheWeek + 1 + weekdayAsPerNativeIndex) as WeekdayIndices;
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
  return (weekdayAsPerChangedIndex <= diversion
    ? weekdayAsPerChangedIndex + startOfTheWeek
    : weekdayAsPerChangedIndex - diversion - 1) as WeekdayIndices;
}

/**
 * Gives the index of day-of-the-week on the 1st of the provided month-year.
 * @param year Specify a year
 * @param month Specify a month
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getWeekDayOnFirstDateOfMonth(year: number, month: number, startOfTheWeek: number): WeekdayIndices {
  const date = new Date();
  date.setDate(1);
  date.setMonth(month);
  date.setFullYear(year);
  return getInfluencedWeekDayIndexAsPerAStartDay(date.getDay(), startOfTheWeek) as WeekdayIndices;
}

function getWeekendColumns(
  startOfTheWeek: number
): { weekend: WeekdayIndices[]; saturday: WeekdayIndices; sunday: WeekdayIndices } {
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
// 37 - 72
// 73 - 108
export function getStartOfRangeForAYear(year: number) {
  // last cell will always be a perfect multiple of 20
  // take 2016 as an example
  if (year % 20 === 0) {
    return 20 * (year / 20 - 1) + 1;
  }
  // logic derived from a few examples like 2021, 1981, 1973
  return 20 * Number((year / 20).toFixed(0)) + 1;
}

export function getMonthsRangeMatrix(
  selectedMonth: number,
  isDisabled: (params: IsDisabledParams) => boolean
): Array<MonthCell>[] {
  const months = Array.from({ length: 12 }, (v, k) => {
    return {
      month: k as MonthIndices,
      isCurrentMonth: new Date().getMonth() === k,
      isSelectedMonth: selectedMonth === k,
      isDisabled: isDisabled({
        year: -1,
        month: k as MonthIndices,
        weekday: -1,
        date: -1,
      }),
    };
  });
  return [months.slice(0, 3), months.slice(3, 6), months.slice(6, 9), months.slice(9, 12)];
}

export function getPreviousYearsViewMatrixForARange(rangeStartYear: number) {
  if (rangeStartYear === 1) {
    return 1;
  }
  return getStartOfRangeForAYear(rangeStartYear - 1);
}

export function getNextYearsViewMatrixForARange(rangeStartYear: number) {
  return getStartOfRangeForAYear(rangeStartYear + 20);
}

export function getYearRangeForAStartYear(rangeStartYear: number) {
  return [rangeStartYear, rangeStartYear + 19];
}

export function getYearsViewMatrixForAStartOfRangeYear(
  rangeStartYear: number,
  selectedYear: number,
  isDisabled: (params: IsDisabledParams) => boolean
): Array<YearCell>[] {
  const years = Array.from({ length: 20 }, (v, index) => {
    return {
      year: rangeStartYear + index,
      isCurrentYear: new Date().getFullYear() === rangeStartYear + index,
      isSelectedYear: selectedYear === rangeStartYear + index,
      isDisabled: isDisabled({
        year: rangeStartYear + index,
        month: -1,
        weekday: -1,
        date: -1,
      }),
    };
  });
  return [years.slice(0, 5), years.slice(5, 10), years.slice(10, 15), years.slice(15, 20)];
}

export function getCalendarViewMatrix(
  yearInView: number,
  monthInView: MonthIndices,
  startOfTheWeek: WeekdayIndices,
  selectedYear: number,
  selectedMonth: MonthIndices,
  selectedDayOfMonth: number,
  isDisabled: (params: IsDisabledParams) => boolean
): Array<DayOfMonthCell>[] {
  const matrix: Array<DayOfMonthCell>[] = [[], [], [], [], [], []];

  const currentMonthDatesStartIndex = getWeekDayOnFirstDateOfMonth(yearInView, monthInView, startOfTheWeek);

  const weekends = getWeekendColumns(startOfTheWeek);

  const todaysDate = new Date().getDate();
  const todaysMonth = new Date().getMonth();
  const todaysYear = new Date().getFullYear();
  const totalDaysInCurrentMonth = getDaysInMonth(yearInView, monthInView);

  const isPrevMonthFromLastYear = monthInView === 0;
  const isCurrentMonthLast = monthInView === 11;

  const totalDaysInPrevMonth = getDaysInMonth(
    isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView,
    getPreviousMonth(monthInView)
  );

  // calendar has 6 rows (0 - 5)
  let row = 0;
  let weekColumn: WeekdayIndices = 0;

  //  31 - (6 - 1) === 26
  const lastMonthDateStartFrom = totalDaysInPrevMonth - (currentMonthDatesStartIndex - 1);

  // first loop to fill cell values of last month
  for (let i = lastMonthDateStartFrom; i <= totalDaysInPrevMonth; i++) {
    if (weekColumn === 7) {
      weekColumn = 0;
      row++;
    }
    matrix[row].push({
      date: i,
      month: getPreviousMonth(monthInView),
      activeMonthInView: false,
      year: isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView,
      isWeekend: typeof weekends.weekend.find((c) => c === weekColumn) === 'number' ? true : false,
      isSat: weekends.saturday === weekColumn,
      isSun: weekends.sunday === weekColumn,
      isToday:
        i === todaysDate &&
        getPreviousMonth(monthInView) === todaysMonth &&
        (isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView) === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: weekColumn === 0,
      isLastColumn: weekColumn === 6,
      isSelected:
        getPreviousMonth(monthInView) === selectedMonth &&
        (isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView) === selectedYear &&
        i === selectedDayOfMonth,
      // TODO change weekday logic to include native index
      // not modified
      isDisabled: isDisabled({
        year: isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView,
        month: getPreviousMonth(monthInView),
        weekday: getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek),
        date: i,
      }),
    });
    weekColumn++;
  }

  // second loop to fill cell values of current month
  for (let k = 1; k <= totalDaysInCurrentMonth; k++) {
    if (weekColumn === 7) {
      weekColumn = 0;
      row++;
    }
    matrix[row].push({
      date: k,
      month: monthInView,
      activeMonthInView: true,
      year: yearInView,
      isWeekend: typeof weekends.weekend.find((c) => c === weekColumn) === 'number' ? true : false,
      isSat: weekends.saturday === weekColumn,
      isSun: weekends.sunday === weekColumn,
      isToday: k === todaysDate && monthInView === todaysMonth && yearInView === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: weekColumn === 0,
      isLastColumn: weekColumn === 6,
      isSelected: monthInView === selectedMonth && yearInView === selectedYear && k === selectedDayOfMonth,
      isDisabled: isDisabled({
        year: yearInView,
        month: monthInView,
        weekday: getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek),
        date: k,
      }),
    });
    weekColumn++;
  }

  let k = 1;
  // last loop to fill cell values of next month

  while (matrix[5].length < 7) {
    if (weekColumn === 7) {
      weekColumn = 0;
      row++;
    }
    matrix[row].push({
      date: k,
      month: getNextMonth(monthInView),
      activeMonthInView: false,
      year: isCurrentMonthLast ? yearInView + 1 : yearInView,
      isWeekend: typeof weekends.weekend.find((c) => c === weekColumn) === 'number' ? true : false,
      isSat: weekends.saturday === weekColumn,
      isSun: weekends.sunday === weekColumn,
      isToday:
        k === todaysDate &&
        getNextMonth(monthInView) === todaysMonth &&
        (isCurrentMonthLast ? yearInView + 1 : yearInView) === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: weekColumn === 0,
      isLastColumn: weekColumn === 6,
      isSelected:
        getNextMonth(monthInView) === selectedMonth &&
        (isCurrentMonthLast ? yearInView + 1 : yearInView) === selectedYear &&
        k === selectedDayOfMonth,
      isDisabled: isDisabled({
        year: isCurrentMonthLast ? yearInView + 1 : yearInView,
        month: getNextMonth(monthInView),
        weekday: getNativeWeekDayIndexFromAStartDayInfluencedIndex(weekColumn, startOfTheWeek),
        date: k,
      }),
    });
    weekColumn++;
    k++;
  }

  return matrix;
}
