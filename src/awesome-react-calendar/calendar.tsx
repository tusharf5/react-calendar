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
    <section className='arc'>
      <header className='arc_header'>
        <button className='arc_header_nav arc_header_nav-prev' onClick={onPrevMonth}>
          ←
        </button>
        {view === 'month_dates' ? (
          <div className='arc_header_label arc_header_label-days-of-month' onClick={() => setView('years')}>
            <div>
              <span>{NATIVE_INDEX_TO_LABEL_MONTHS_MAP[monthInView]}</span>
            </div>
            <div>
              <span>{yearInView}</span>
            </div>
          </div>
        ) : view === 'months' ? (
          <div className='arc_header_label arc_header_label-months'>
            <div onClick={() => setView('years')}>
              <span>{yearInView}</span>
            </div>
          </div>
        ) : (
          <div className='arc_header_label arc_header_label-years' onClick={() => setView('month_dates')}>
            <div>
              <span>
                {yearMatrixRangeStart}-{yearMatrixRangeEnd}
              </span>
            </div>
          </div>
        )}
        <button className='arc_header_nav arc_header_nav-next' onClick={onNextMonth}>
          →
        </button>
      </header>
      <main className='arc_view'>
        {view === 'months' && (
          <div className='arc_view-months'>
            {monthMatrix.map((row, index) => (
              <div className='arc_view_row' key={index}>
                {row.map((cell) => (
                  <div
                    className={`arc_view_cell${cell.isCurrentMonth ? ' arc_this_month' : ''}${
                      cell.isSelectedMonth ? ' arc_selected' : ''
                    }${cell.isDisabled ? ' arc_disabled' : ''}`}
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
        )}
        {view === 'years' && (
          <div className='arc_view-years'>
            {yearMatrix.map((row, index) => (
              <div className='arc_view_row' key={index}>
                {row.map((cell) => (
                  <div
                    className={`arc_view_cell${cell.isCurrentYear ? ' arc_this_year' : ''}${
                      cell.isSelectedYear ? ' arc_selected' : ''
                    }${cell.isDisabled ? ' arc_disabled' : ''}`}
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
        )}
        {view === 'month_dates' && (
          <>
            <ul className='arc_view_weekdays'>
              {Object.keys(WEEK_DAYS).map((weekDay) => (
                <li
                  key={weekDay}
                  className={`arc_view_weekdays_cell${
                    WEEK_DAYS[Number(weekDay) as WeekdayIndices] === 'Sa' ||
                    WEEK_DAYS[Number(weekDay) as WeekdayIndices] === 'Su'
                      ? ' arc_wknd'
                      : ''
                  }`}>
                  <span>{WEEK_DAYS[Number(weekDay) as WeekdayIndices]}</span>
                </li>
              ))}
            </ul>
            <div className='arc_view-days-of-month' role='grid'>
              {matrix.map((row, index) => (
                <div className='arc_view_row' key={index}>
                  {row.map((cell) => (
                    <div
                      key={cell.date}
                      className={`arc_view_cell${cell.activeMonthInView ? ' arc_active' : ''}${
                        cell.isWeekend ? ' arc_wknd' : ''
                      }${cell.isSat ? ' arc_sat' : ''}${cell.isSun ? ' arc_sun' : ''}${
                        cell.isToday ? ' arc_today' : ''
                      }${cell.isFirstRow ? ' arc_fr' : ''}${cell.isLastRow ? ' arc_lr' : ''}${
                        cell.isFirsColumn ? ' arc_fc' : ''
                      }${cell.isLastColumn ? ' arc_lc' : ''}${cell.isSelected ? ' arc_selected' : ''}${
                        cell.isDisabled ? ' arc_disabled' : ''
                      }`}>
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
          </>
        )}
      </main>
    </section>
  );
}

export default Calendar;
