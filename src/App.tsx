/* eslint-disable no-loop-func */
import React, { useCallback, useMemo, useState } from "react";

import "./App.css";

function isALeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const YEARS = Array.from(
  {
    length: 2100 - 1960,
  },
  (v, k) => 1960 + k
);

/**
 * This weekday index-to-label map is what is used by the Date object
 */
const NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const NATIVE_INDEX_TO_LABEL_MONTHS_MAP: Record<number, string> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sept",
  9: "Aug",
  10: "Nov",
  11: "Dec",
};

function getDaysInMonth(year: number, month: number) {
  const map: Record<number, number> = {
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

/**
 * Creates and return a new weekday index-label map as per the **start**
 * parameter. By default this will return the same weekday index-label map
 * used by the Date object.
 * 0 means Sun - if we follow the native Date convention
 * Now if someone wants to start their week from Mon, then 0 would mean Monday which is different from
 * the convention used by the Date methods.
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getWeekDaysIndexToLabelMapForAStartOfTheWeek(
  startOfTheWeek = 0
): Record<number, string> {
  // we break the [0,1,2,3,4,5,6] in two parts
  // [start,4,5,6] and [0,1,2] and join them with their labels
  // this is just to re-order the label in the **correct order**
  return Object.keys(NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP)
    .slice(startOfTheWeek, 7)
    .concat(Object.keys(NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP).slice(0, startOfTheWeek))
    .reduce((acc, curr, index) => {
      // acc[0] = DEFAULT_WEEKDAY_INDEX[3]
      acc[Number(index)] = NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP[Number(curr)];
      return acc;
    }, {} as Record<number, string>);
}

/**
 * Finds and returns the corresponding day-of-the-week as per the **start of the week**
 * for a default day-of-the-week which is as per the Date object.
 * @param weekdayAsPerNativeIndex day-of-the-week as per the Date object
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getNativeWeekDayIndexAsPerAStartDay(
  weekdayAsPerNativeIndex: number,
  startOfTheWeek = 0
): number {
  return weekdayAsPerNativeIndex >= startOfTheWeek
    ? weekdayAsPerNativeIndex - startOfTheWeek
    : 6 - startOfTheWeek + 1 + weekdayAsPerNativeIndex;
}

/**
 * Gives the index of day-of-the-week on the 1st of the provided month-year.
 * @param year Specify a year
 * @param month Specify a month
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getWeekDayOnFirstDateOfMonth(
  year: number,
  month: number,
  startOfTheWeek: number
) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(month);
  date.setFullYear(year);
  return getNativeWeekDayIndexAsPerAStartDay(date.getDay(), startOfTheWeek);
}

function getWeekendColumns(startOfTheWeek: number) {
  if (startOfTheWeek === 0) {
    return { weekend: [7, 1], saturday: 7, sunday: 1 };
  } else if (startOfTheWeek === 1) {
    return { weekend: [6, 7], saturday: 6, sunday: 7 };
  } else if (startOfTheWeek === 2) {
    return { weekend: [5, 6], saturday: 5, sunday: 6 };
  } else if (startOfTheWeek === 3) {
    return { weekend: [4, 5], saturday: 4, sunday: 5 };
  } else if (startOfTheWeek === 4) {
    return { weekend: [3, 4], saturday: 3, sunday: 4 };
  } else if (startOfTheWeek === 5) {
    return { weekend: [2, 3], saturday: 2, sunday: 3 };
  } else {
    return { weekend: [1, 2], saturday: 1, sunday: 2 };
  }
}

function getPreviousMonth(month: number) {
  return month === 0 ? 11 : month - 1;
}

function getNextMonth(month: number) {
  return month === 11 ? 0 : month + 1;
}

function getPreviousYear(year: number) {
  return year - 1;
}

function getCalendarViewMatrix(
  year: number,
  month: number,
  startOfTheWeek: number
): Array<{
  date: number;
  month: number;
  year: number;
  activeMonthInView: boolean;
  isWeekend: boolean;
  isSat: boolean;
  isToday: boolean;
  isFirstRow: boolean;
  isLastRow: boolean;
  isFirsColumn: boolean;
  isLastColumn: boolean;
  isSun: boolean;
}>[] {
  const matrix: Array<{
    date: number;
    month: number;
    year: number;
    activeMonthInView: boolean;
    isWeekend: boolean;
    isToday: boolean;
    isSat: boolean;
    isFirstRow: boolean;
    isLastRow: boolean;
    isFirsColumn: boolean;
    isLastColumn: boolean;
    isSun: boolean;
  }>[] = [[], [], [], [], [], []];

  const currentMonthDatesStartIndex = getWeekDayOnFirstDateOfMonth(
    year,
    month,
    startOfTheWeek
  );

  const weekends = getWeekendColumns(startOfTheWeek);
  const todaysDate = new Date().getDate();
  const totalDaysInCurrentMonth = getDaysInMonth(year, month);

  const isPrevMonthFromLastYear = month === 0;
  const isCurrentMonthLast = month === 11;

  const totalDaysInPrevMonth = getDaysInMonth(
    isPrevMonthFromLastYear ? getPreviousYear(year) : year,
    getPreviousMonth(month)
  );

  // calendar has 6 rows (0 - 5)
  let row = 0;
  let columnAdded = 0;

  //  31 - (6 - 1) === 26
  const lastMonthDateStartFrom =
    totalDaysInPrevMonth - (currentMonthDatesStartIndex - 1);

  // first loop to fill cell values of last month
  for (let i = lastMonthDateStartFrom; i <= totalDaysInPrevMonth; i++) {
    if (columnAdded === 7) {
      columnAdded = 0;
      row++;
    }
    matrix[row].push({
      date: i,
      month: getPreviousMonth(month),
      activeMonthInView: false,
      year: isPrevMonthFromLastYear ? getPreviousYear(year) : year,
      isWeekend: weekends.weekend.find((c) => c === columnAdded + 1)
        ? true
        : false,
      isSat: weekends.saturday === columnAdded + 1,
      isSun: weekends.sunday === columnAdded + 1,
      isToday: false,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: columnAdded + 1 === 1,
      isLastColumn: columnAdded + 1 === 7,
    });
    columnAdded++;
  }

  // second loop to fill cell values of current month
  for (let k = 1; k <= totalDaysInCurrentMonth; k++) {
    if (columnAdded === 7) {
      columnAdded = 0;
      row++;
    }
    matrix[row].push({
      date: k,
      month: month,
      activeMonthInView: true,
      year: year,
      isWeekend: weekends.weekend.find((c) => c === columnAdded + 1)
        ? true
        : false,
      isSat: weekends.saturday === columnAdded + 1,
      isSun: weekends.sunday === columnAdded + 1,
      isToday: k === todaysDate,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: columnAdded + 1 === 1,
      isLastColumn: columnAdded + 1 === 7,
    });
    columnAdded++;
  }

  let k = 1;
  // last loop to fill cell values of next month

  while (matrix[5].length < 7) {
    if (columnAdded === 7) {
      columnAdded = 0;
      row++;
    }
    matrix[row].push({
      date: k,
      month: getNextMonth(month),
      activeMonthInView: false,
      year: isCurrentMonthLast ? year + 1 : year,
      isWeekend: weekends.weekend.find((c) => c === columnAdded + 1)
        ? true
        : false,
      isSat: weekends.saturday === columnAdded + 1,
      isSun: weekends.sunday === columnAdded + 1,
      isToday: false,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: columnAdded + 1 === 1,
      isLastColumn: columnAdded + 1 === 7,
    });
    columnAdded++;
    k++;
  }

  return matrix;
}

function App() {
  // in view state
  const startOfTheWeek = 1;
  const WEEK_DAYS = useMemo(() => {
    return getWeekDaysIndexToLabelMapForAStartOfTheWeek(startOfTheWeek);
  }, [startOfTheWeek]);
  const [monthInView, setMonthInView] = useState(new Date().getMonth());
  const [dayOfMonthInView] = useState(new Date().getDate());
  const [yearInView, setYearInView] = useState(new Date().getFullYear());
  const onMonthChange = useCallback(
    (e) => {
      setMonthInView(Number(e.target.value));
    },
    [setMonthInView]
  );
  const onYearChange = useCallback(
    (e) => {
      setYearInView(Number(e.target.value));
    },
    [setYearInView]
  );

  const matrix = useMemo(() => {
    return getCalendarViewMatrix(yearInView, monthInView, startOfTheWeek);
  }, [yearInView, monthInView, startOfTheWeek]);

  return (
    <section className="App">
      <header>
        <div className="date-header">
          <select value={monthInView} onChange={onMonthChange}>
            {Object.keys(NATIVE_INDEX_TO_LABEL_MONTHS_MAP).map((month) => (
              <option key={month} value={month}>
                {NATIVE_INDEX_TO_LABEL_MONTHS_MAP[Number(month)]}
              </option>
            ))}
          </select>
          <span>{dayOfMonthInView}</span>
          <select value={yearInView} onChange={onYearChange}>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <ul className="weekdays-header">
          {Object.keys(WEEK_DAYS).map((weekDay) => (
            <li key={weekDay} className="weekdays-header-day">
              {WEEK_DAYS[Number(weekDay)]}
            </li>
          ))}
        </ul>
      </header>
      <main>
        <div>
          {matrix.map((row, index) => (
            <div key={index}>
              {row.map((cell) => (
                <div
                  key={cell.date}
                  className={`days-cell${
                    cell.activeMonthInView ? " active-month" : ""
                  }${cell.isWeekend ? " weekend" : ""}${
                    cell.isSat ? " saturday" : ""
                  }${cell.isSun ? " sunday" : ""}${
                    cell.isToday ? " today" : ""
                  }${cell.isFirstRow ? " fr" : ""}${
                    cell.isLastRow ? " lr" : ""
                  }${cell.isFirsColumn ? " fc" : ""}${
                    cell.isLastColumn ? " lc" : ""
                  }`}
                >
                  {cell.date}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}

export default App;
