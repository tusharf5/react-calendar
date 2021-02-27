import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { DayOfMonthCell, IsDisabledParams, MonthCell, MonthIndices, YearCell, WeekdayIndices } from './types';

import {
  getWeekDaysIndexToLabelMapForAStartOfTheWeek,
  getStartOfRangeForAYear,
  getPreviousYear,
  getPreviousMonth,
  getPreviousYearsViewMatrixForARange,
  getNextYear,
  getNextMonth,
  getNextYearsViewMatrixForARange,
  getYearsViewMatrixForAStartOfRangeYear,
  getMonthsRangeMatrix,
  getCalendarViewMatrix,
  getYearRangeForAStartYear,
} from './date-utils';

import { NATIVE_INDEX_TO_LABEL_MONTHS_MAP } from './constants';

interface Props {
  value?: string;
  startOfWeek?: WeekdayIndices;
  isDisabled: (params: IsDisabledParams) => boolean;
}

function Calendar({ value, startOfWeek = 1, isDisabled }: Props) {
  // in view state
  const [startOfTheWeek] = useState(startOfWeek);
  const WEEK_DAYS = useMemo(() => {
    return getWeekDaysIndexToLabelMapForAStartOfTheWeek(startOfTheWeek);
  }, [startOfTheWeek]);
  // in view

  const [view, setView] = useState<'years' | 'months' | 'month_dates'>('month_dates');
  const [monthInView, setMonthInView] = useState<MonthIndices>(
    (value ? new Date(value).getMonth() : new Date().getMonth()) as MonthIndices
  );
  const [yearInView, setYearInView] = useState(value ? new Date(value).getFullYear() : new Date().getFullYear());
  const [startingYearForCurrRange, setStartingYearForCurrRange] = useState(getStartOfRangeForAYear(yearInView));
  // set date value
  const [selectedMonth, setSelectedMonth] = useState(
    (value ? new Date(value).getMonth() : new Date().getMonth()) as MonthIndices
  );
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
          setYearInView(getNextYear(yearInView));
        }
        setMonthInView(getNextMonth(monthInView));
      }

      if (view === 'years') {
        setStartingYearForCurrRange(getNextYearsViewMatrixForARange(startingYearForCurrRange));
      }

      if (view === 'months') {
        setYearInView(getNextYear(yearInView));
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
    (cell: DayOfMonthCell) => {
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

  const yearMatrix = useMemo<YearCell[][]>(() => {
    return getYearsViewMatrixForAStartOfRangeYear(startingYearForCurrRange, selectedYear, isDisabled);
  }, [startingYearForCurrRange, selectedYear, isDisabled]);

  const monthMatrix = useMemo<MonthCell[][]>(() => {
    return getMonthsRangeMatrix(selectedMonth, isDisabled);
  }, [selectedMonth, isDisabled]);

  const [yearMatrixRangeStart, yearMatrixRangeEnd] = useMemo(() => {
    return getYearRangeForAStartYear(startingYearForCurrRange);
  }, [startingYearForCurrRange]);

  const matrix = useMemo(() => {
    return getCalendarViewMatrix(
      yearInView,
      monthInView,
      startOfTheWeek,
      selectedYear,
      selectedMonth,
      selectedDate,
      isDisabled
    );
  }, [yearInView, monthInView, startOfTheWeek, selectedYear, selectedMonth, selectedDate, isDisabled]);

  return (
    <section className='App'>
      <header>
        <button onClick={onPrevMonth}>←</button>
        {view === 'month_dates' ? (
          <div className='header-action' onClick={() => setView('years')}>
            <div>
              <span>{NATIVE_INDEX_TO_LABEL_MONTHS_MAP[monthInView]}</span>
            </div>
            <div>
              <span>{yearInView}</span>
            </div>
          </div>
        ) : view === 'months' ? (
          <div className='header-action'>
            <div onClick={() => setView('years')}>
              <span>{yearInView}</span>
            </div>
          </div>
        ) : (
          <div className='header-action' onClick={() => setView('month_dates')}>
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
          <div className='months'>
            {monthMatrix.map((row, index) => (
              <div className='months-row' key={index}>
                {row.map((cell) => (
                  <div
                    className={`month-cell${cell.isCurrentMonth ? ' current-month' : ''}${
                      cell.isSelectedMonth ? ' selected' : ''
                    }${cell.isDisabled ? ' disabled' : ''}`}
                    key={cell.month}>
                    <button
                      disabled={cell.isDisabled}
                      tabIndex={cell.isDisabled ? -1 : 0}
                      onClick={() => {
                        setMonthInView(cell.month);
                        setView('month_dates');
                      }}>
                      {NATIVE_INDEX_TO_LABEL_MONTHS_MAP[cell.month]}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>
      )}
      {view === 'years' && (
        <main>
          <div className='years'>
            {yearMatrix.map((row, index) => (
              <div className='years-row' key={index}>
                {row.map((cell) => (
                  <div
                    className={`year-cell${cell.isCurrentYear ? ' current-year' : ''}${
                      cell.isSelectedYear ? ' selected' : ''
                    }${cell.isDisabled ? ' disabled' : ''}`}
                    key={cell.year}>
                    <button
                      disabled={cell.isDisabled}
                      tabIndex={cell.isDisabled ? -1 : 0}
                      onClick={() => {
                        setYearInView(cell.year);
                        setView('months');
                      }}>
                      {cell.year}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>
      )}
      {view === 'month_dates' && (
        <main>
          <ul className='weekdays-header'>
            {Object.keys(WEEK_DAYS).map((weekDay) => (
              <li
                key={weekDay}
                className={`weekdays-header-day${
                  WEEK_DAYS[Number(weekDay) as WeekdayIndices] === 'Sa' ||
                  WEEK_DAYS[Number(weekDay) as WeekdayIndices] === 'Su'
                    ? ' weekend'
                    : ''
                }`}>
                <span>{WEEK_DAYS[Number(weekDay) as WeekdayIndices]}</span>
              </li>
            ))}
          </ul>
          <div className='month-dates' role='grid'>
            {matrix.map((row, index) => (
              <div className='month-dates-row' key={index}>
                {row.map((cell) => (
                  <div
                    key={cell.date}
                    className={`month-dates-cell${cell.activeMonthInView ? ' active-month' : ''}${
                      cell.isWeekend ? ' weekend' : ''
                    }${cell.isSat ? ' saturday' : ''}${cell.isSun ? ' sunday' : ''}${cell.isToday ? ' today' : ''}${
                      cell.isFirstRow ? ' fr' : ''
                    }${cell.isLastRow ? ' lr' : ''}${cell.isFirsColumn ? ' fc' : ''}${cell.isLastColumn ? ' lc' : ''}${
                      cell.isSelected ? ' selected' : ''
                    }${cell.isDisabled ? ' disabled' : ''}`}>
                    <button
                      disabled={cell.isDisabled}
                      tabIndex={cell.isDisabled ? -1 : 0}
                      onClick={() => onSelectDate(cell)}>
                      {cell.date}
                    </button>
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

export default Calendar;
