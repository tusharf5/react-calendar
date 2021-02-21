import React, { useCallback, useMemo, useState } from "react";

import "./App.css";

function isALeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const MAX_CELLS = 42;

const YEARS = Array.from(
  {
    length: 2100 - 1960,
  },
  (v, k) => 1960 + k
);

/**
 * This weekday index-label map is what is used by the Date object
 */
const DEFAULT_WEEKDAY_INDEX: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const MONTHS: Record<number, string> = {
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
 * @param start index of the day to be considered as start of the week
 */
function getWeekDaysIndexToLabelMap(start = 0): Record<number, string> {
  // we break the [0,1,2,3,4,5,6] in two parts
  // [start,4,5,6] and [0,1,2] and join them with their labels
  // this is just to re-order the label in the **correct order**
  return Object.keys(DEFAULT_WEEKDAY_INDEX)
    .slice(start, 7)
    .concat(Object.keys(DEFAULT_WEEKDAY_INDEX).slice(0, start))
    .reduce((acc, curr, index) => {
      // acc[0] = DEFAULT_WEEKDAY_INDEX[3]
      acc[Number(index)] = DEFAULT_WEEKDAY_INDEX[Number(curr)];
      return acc;
    }, {} as Record<number, string>);
}

/**
 * Finds and returns the corresponding day-of-the-week as per the **start of the week**
 * for a default day-of-the-week which is as per the Date object
 * @param weekdaydefaultIndex day-of-the-week as per the Date object
 * @param start index of the day to be considered as start of the week
 */
function getWeekDayIndexAsPerStartDay(
  weekdaydefaultIndex: number,
  start = 0
): number {
  return weekdaydefaultIndex >= start
    ? weekdaydefaultIndex - start
    : 6 - start + 1 + weekdaydefaultIndex;
}

/**
 * Gives the index of day-of-the-week on the 1st of the provided month-year.
 * @param year Specify a year
 * @param month Specify a month
 * @param start index of the day to be considered as start of the week
 */
function getWeekDayOnFirstDateOfMonth(
  year: number,
  month: number,
  start: number
) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(month);
  date.setFullYear(year);
  return getWeekDayIndexAsPerStartDay(date.getDay(), start);
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
  startOfWeek: number
): { date: number; month: number; year: number; activeMonthInView: boolean }[] {
  const matrix = [];

  const currentMonthDatesStartIndex = getWeekDayOnFirstDateOfMonth(
    year,
    month,
    startOfWeek
  );

  const totalDaysInCurrentMonth = getDaysInMonth(year, month);

  const isPrevMonthFromLastYear = month === 0;
  const isCurrentMonthLast = month === 11;

  const totalDaysInPrevMonth = getDaysInMonth(
    isPrevMonthFromLastYear ? getPreviousYear(year) : year,
    getPreviousMonth(month)
  );

  //  31 - (6 - 1) === 26
  const lastMonthDateStartFrom =
    totalDaysInPrevMonth - (currentMonthDatesStartIndex - 1);

  // first loop to fill cell values of last month
  for (let i = lastMonthDateStartFrom; i <= totalDaysInPrevMonth; i++) {
    matrix.push({
      date: i,
      month: getPreviousMonth(month),
      activeMonthInView: false,
      year: isPrevMonthFromLastYear ? getPreviousYear(year) : year,
    });
  }

  // second loop to fill cell values of current month
  for (let k = 1; k <= totalDaysInCurrentMonth; k++) {
    matrix.push({
      date: k,
      month: month,
      activeMonthInView: true,
      year: year,
    });
  }
  const remainingCellsCount = MAX_CELLS - matrix.length;
  // last loop to fill cell values of next month
  for (let k = 1; k <= remainingCellsCount; k++) {
    matrix.push({
      date: k,
      month: getNextMonth(month),
      activeMonthInView: false,
      year: isCurrentMonthLast ? year + 1 : year,
    });
  }

  return matrix;
}

function App() {
  // in view state
  const start = 3;
  const WEEK_DAYS = useMemo(() => {
    return getWeekDaysIndexToLabelMap(start);
  }, [start]);
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
  const matrix = getCalendarViewMatrix(yearInView, monthInView, start);
  return (
    <section className="App">
      <header>
        <div className="date-header">
          <select value={monthInView} onChange={onMonthChange}>
            {Object.keys(MONTHS).map((month) => (
              <option key={month} value={month}>
                {MONTHS[Number(month)]}
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
          {matrix.slice(0, 7).map((num) => (
            <div
              key={num.date}
              className={`days-cell ${
                num.activeMonthInView ? "active-in-view" : ""
              }`}
            >
              {num.date}
            </div>
          ))}
        </div>
        <div>
          {matrix.slice(7, 14).map((num) => (
            <div
              key={num.date}
              className={`days-cell ${
                num.activeMonthInView ? "active-in-view" : ""
              }`}
            >
              {num.date}
            </div>
          ))}
        </div>
        <div>
          {matrix.slice(14, 21).map((num) => (
            <div
              key={num.date}
              className={`days-cell ${
                num.activeMonthInView ? "active-in-view" : ""
              }`}
            >
              {num.date}
            </div>
          ))}
        </div>
        <div>
          {matrix.slice(21, 28).map((num) => (
            <div
              key={num.date}
              className={`days-cell ${
                num.activeMonthInView ? "active-in-view" : ""
              }`}
            >
              {num.date}
            </div>
          ))}
        </div>
        <div>
          {matrix.slice(28, 35).map((num) => (
            <div
              key={num.date}
              className={`days-cell ${
                num.activeMonthInView ? "active-in-view" : ""
              }`}
            >
              {num.date}
            </div>
          ))}
        </div>
        <div>
          {matrix.slice(35, 42).map((num) => (
            <div
              key={num.date}
              className={`days-cell ${
                num.activeMonthInView ? "active-in-view" : ""
              }`}
            >
              {num.date}
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}

export default App;
