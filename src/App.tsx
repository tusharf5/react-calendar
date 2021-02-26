/* eslint-disable no-loop-func */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import './App.css';

interface Cell {
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
  isSelected: boolean;
  isLastColumn: boolean;
  isSun: boolean;
}

function isALeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * This weekday index-to-label map is what is used by the Date object
 */
const NATIVE_INDEX_TO_LABEL_WEEKDAY_MAP: Record<number, string> = {
  0: 'Su',
  1: 'Mo',
  2: 'Tu',
  3: 'We',
  4: 'Th',
  5: 'Fr',
  6: 'Sa',
};

const NATIVE_INDEX_TO_LABEL_MONTHS_MAP: Record<number, string> = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
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
function getWeekDaysIndexToLabelMapForAStartOfTheWeek(startOfTheWeek = 0): Record<number, string> {
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
 * So if the Date object says that some date has 3 day-of-the-week. No this 3 means Wednesday as per the native index for week days.
 * But if a calendar starts from Monday, then wednesday will not be at 3 but it will be at some other index which is according to a different index-label map.
 * So this method returns that index for wednesday.
 * @param weekdayAsPerNativeIndex day-of-the-week as per the Date object
 * @param startOfTheWeek index of the day to be considered as start of the week
 */
function getWeekDayIndexAsPerAStartDay(weekdayAsPerNativeIndex: number, startOfTheWeek = 0): number {
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
function getWeekDayOnFirstDateOfMonth(year: number, month: number, startOfTheWeek: number) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(month);
  date.setFullYear(year);
  return getWeekDayIndexAsPerAStartDay(date.getDay(), startOfTheWeek);
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

// 1 - 36 (36 years in one range block)
// 37 - 72
// 73 - 108

function getStartOfRangeForAYear(year: number) {
  // last cell will always be a perfect multiple of 36
  // take 2016 as an example
  if (year % 36 === 0) {
    return 36 * (year / 36 - 1) + 1;
  }
  // logic derived from a few examples like 2021, 1981, 1973
  return 36 * Number((year / 36).toFixed(0)) + 1;
}

function getMonthsRangeMatrix(): number[] {
  return Array.from({ length: 12 }, (v, k) => k);
}

function getPreviousYearsViewMatrixForARange(rangeStartYear: number) {
  if (rangeStartYear === 1) {
    return 1;
  }
  return getStartOfRangeForAYear(rangeStartYear - 1);
}

function getNextYearsViewMatrixForARange(rangeStartYear: number) {
  return getStartOfRangeForAYear(rangeStartYear + 36);
}

function getYearRangeForAStartYear(rangeStartYear: number) {
  return [rangeStartYear, rangeStartYear + 35];
}

function getYearsViewMatrixForAStartOfRangeYear(rangeStartYear: number) {
  return Array.from({ length: 36 }, (v, index) => {
    return rangeStartYear + index;
  });
}

function getCalendarViewMatrix(
  yearInView: number,
  monthInView: number,
  startOfTheWeek: number,
  selectedYear: number,
  selectedMonth: number,
  selectedDayOfMonth: number
): Array<Cell>[] {
  const matrix: Array<Cell>[] = [[], [], [], [], [], []];

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
  let columnAdded = 0;

  //  31 - (6 - 1) === 26
  const lastMonthDateStartFrom = totalDaysInPrevMonth - (currentMonthDatesStartIndex - 1);

  // first loop to fill cell values of last month
  for (let i = lastMonthDateStartFrom; i <= totalDaysInPrevMonth; i++) {
    if (columnAdded === 7) {
      columnAdded = 0;
      row++;
    }
    matrix[row].push({
      date: i,
      month: getPreviousMonth(monthInView),
      activeMonthInView: false,
      year: isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView,
      isWeekend: weekends.weekend.find((c) => c === columnAdded + 1) ? true : false,
      isSat: weekends.saturday === columnAdded + 1,
      isSun: weekends.sunday === columnAdded + 1,
      isToday:
        i === todaysDate &&
        getPreviousMonth(monthInView) === todaysMonth &&
        (isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView) === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: columnAdded + 1 === 1,
      isLastColumn: columnAdded + 1 === 7,
      isSelected:
        getPreviousMonth(monthInView) === selectedMonth &&
        (isPrevMonthFromLastYear ? getPreviousYear(yearInView) : yearInView) === selectedYear &&
        i === selectedDayOfMonth,
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
      month: monthInView,
      activeMonthInView: true,
      year: yearInView,
      isWeekend: weekends.weekend.find((c) => c === columnAdded + 1) ? true : false,
      isSat: weekends.saturday === columnAdded + 1,
      isSun: weekends.sunday === columnAdded + 1,
      isToday: k === todaysDate && monthInView === todaysMonth && yearInView === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: columnAdded + 1 === 1,
      isLastColumn: columnAdded + 1 === 7,
      isSelected: monthInView === selectedMonth && yearInView === selectedYear && k === selectedDayOfMonth,
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
      month: getNextMonth(monthInView),
      activeMonthInView: false,
      year: isCurrentMonthLast ? yearInView + 1 : yearInView,
      isWeekend: weekends.weekend.find((c) => c === columnAdded + 1) ? true : false,
      isSat: weekends.saturday === columnAdded + 1,
      isSun: weekends.sunday === columnAdded + 1,
      isToday:
        k === todaysDate &&
        getNextMonth(monthInView) === todaysMonth &&
        (isCurrentMonthLast ? yearInView + 1 : yearInView) === todaysYear,
      isFirstRow: row === 0,
      isLastRow: row === 5,
      isFirsColumn: columnAdded + 1 === 1,
      isLastColumn: columnAdded + 1 === 7,
      isSelected:
        getNextMonth(monthInView) === selectedMonth &&
        (isCurrentMonthLast ? yearInView + 1 : yearInView) === selectedYear &&
        k === selectedDayOfMonth,
    });
    columnAdded++;
    k++;
  }

  return matrix;
}

interface Props {
  value?: string;
  startOfWeek?: number;
}

function App({ value, startOfWeek = 1 }: Props) {
  // in view state
  const [startOfTheWeek] = useState(startOfWeek);
  const WEEK_DAYS = useMemo(() => {
    return getWeekDaysIndexToLabelMapForAStartOfTheWeek(startOfTheWeek);
  }, [startOfTheWeek]);
  // in view

  const [view, setView] = useState<'years' | 'months' | 'month_dates'>('month_dates');
  const [monthInView, setMonthInView] = useState(value ? new Date(value).getMonth() : new Date().getMonth());
  const [yearInView, setYearInView] = useState(value ? new Date(value).getFullYear() : new Date().getFullYear());
  const [startingYearForCurrRange, setStartingYearForCurrRange] = useState(getStartOfRangeForAYear(yearInView));
  // set date value
  const [selectedMonth, setSelectedMonth] = useState(value ? new Date(value).getMonth() : new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value).getDate() : new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(value ? new Date(value).getFullYear() : new Date().getFullYear());
  const onPrevMonth = useCallback(
    (e) => {
      if (view === 'month_dates') {
        const isPrevMonthFromLastYear = monthInView === 0;
        if (isPrevMonthFromLastYear) {
          setYearInView(getPreviousYear(yearInView));
        }
        setMonthInView(getPreviousMonth(monthInView));
      }
      if (view === 'years') {
        setStartingYearForCurrRange(getPreviousYearsViewMatrixForARange(startingYearForCurrRange));
      }

      if (view === 'months') {
        setYearInView(yearInView !== 1 ? yearInView - 1 : 1);
      }
    },
    [
      setMonthInView,
      monthInView,
      setYearInView,
      yearInView,
      view,
      setStartingYearForCurrRange,
      startingYearForCurrRange,
    ]
  );
  const onNextMonth = useCallback(
    (e) => {
      if (view === 'month_dates') {
        const isCurrentMonthLast = monthInView === 11;
        if (isCurrentMonthLast) {
          setYearInView(yearInView + 1);
        }
        setMonthInView(getNextMonth(monthInView));
      }

      if (view === 'years') {
        setStartingYearForCurrRange(getNextYearsViewMatrixForARange(startingYearForCurrRange));
      }

      if (view === 'months') {
        setYearInView(yearInView + 1);
      }
    },
    [
      setMonthInView,
      monthInView,
      setYearInView,
      yearInView,
      view,
      setStartingYearForCurrRange,
      startingYearForCurrRange,
    ]
  );

  const onSelectDate = useCallback(
    (cell: Cell) => {
      setSelectedMonth(cell.month);
      setMonthInView(cell.month);
      setSelectedYear(cell.year);
      setYearInView(cell.year);
      setSelectedDate(cell.date);
    },
    [setSelectedMonth, setMonthInView, setSelectedYear, setYearInView, setSelectedDate]
  );

  useEffect(() => {
    setStartingYearForCurrRange(getStartOfRangeForAYear(yearInView));
  }, [yearInView, setStartingYearForCurrRange]);

  const yearMatrix = useMemo(() => {
    return getYearsViewMatrixForAStartOfRangeYear(startingYearForCurrRange);
  }, [startingYearForCurrRange]);

  const monthMatrix = useMemo<number[]>(() => {
    return getMonthsRangeMatrix();
  }, []);

  const [yearMatrixRangeStart, yearMatrixRangeEnd] = useMemo(() => {
    return getYearRangeForAStartYear(startingYearForCurrRange);
  }, [startingYearForCurrRange]);

  const matrix = useMemo(() => {
    return getCalendarViewMatrix(yearInView, monthInView, startOfTheWeek, selectedYear, selectedMonth, selectedDate);
  }, [yearInView, monthInView, startOfTheWeek, selectedYear, selectedMonth, selectedDate]);

  return (
    <section className='App'>
      <header>
        <button onClick={onPrevMonth}>←</button>
        {view === 'month_dates' ? (
          <div onClick={() => setView('years')}>
            <div>
              <span>{NATIVE_INDEX_TO_LABEL_MONTHS_MAP[monthInView]}</span>
            </div>
            <div>
              <span>{yearInView}</span>
            </div>
          </div>
        ) : view === 'months' ? (
          <div>
            <div onClick={() => setView('years')}>
              <span>{yearInView}</span>
            </div>
          </div>
        ) : (
          <div onClick={() => setView('month_dates')}>
            <div>
              <span>
                {yearMatrixRangeStart}-{yearMatrixRangeEnd}
              </span>
            </div>
          </div>
        )}
        <button onClick={onNextMonth}>→</button>
      </header>
      {view === 'months' && (
        <main>
          {monthMatrix.map((month) => (
            <div
              onClick={() => {
                setMonthInView(month);
                setView('month_dates');
              }}>
              {NATIVE_INDEX_TO_LABEL_MONTHS_MAP[month]}
            </div>
          ))}
        </main>
      )}
      {view === 'years' && (
        <main>
          {yearMatrix.map((year) => (
            <div
              onClick={() => {
                setYearInView(year);
                setView('months');
              }}>
              {year}
            </div>
          ))}
        </main>
      )}
      {view === 'month_dates' && (
        <main>
          <ul className='weekdays-header'>
            {Object.keys(WEEK_DAYS).map((weekDay) => (
              <li
                key={weekDay}
                className={`weekdays-header-day${
                  WEEK_DAYS[Number(weekDay)] === 'Sa' || WEEK_DAYS[Number(weekDay)] === 'Su' ? ' weekend' : ''
                }`}>
                {WEEK_DAYS[Number(weekDay)]}
              </li>
            ))}
          </ul>
          <div className='month-dates' role='grid'>
            {matrix.map((row, index) => (
              <div className='month-dates-row' key={index}>
                {row.map((cell) => (
                  <div
                    tabIndex={0}
                    onClick={() => onSelectDate(cell)}
                    key={cell.date}
                    className={`month-dates-cell${cell.activeMonthInView ? ' active-month' : ''}${
                      cell.isWeekend ? ' weekend' : ''
                    }${cell.isSat ? ' saturday' : ''}${cell.isSun ? ' sunday' : ''}${cell.isToday ? ' today' : ''}${
                      cell.isFirstRow ? ' fr' : ''
                    }${cell.isLastRow ? ' lr' : ''}${cell.isFirsColumn ? ' fc' : ''}${cell.isLastColumn ? ' lc' : ''}${
                      cell.isSelected ? ' selected' : ''
                    }`}>
                    {cell.date}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>
      )}
    </section>
  );
}

export default App;
