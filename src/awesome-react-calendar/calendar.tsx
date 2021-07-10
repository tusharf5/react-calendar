import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { DayOfMonthCell, IsDisabledParams, MonthCell, MonthIndices, YearCell, WeekdayIndices } from './types';

import {
  getWeekDaysIndexToLabelMapForAStartOfTheWeek,
  getStartOfRangeForAYear,
  getPreviousYear,
  getPreviousMonth,
  getPreviousRangeStartingYear,
  getNextYear,
  getNextMonth,
  getNextRangeStartingYear,
  getYearsViewMetrix,
  getMonthViewMetrix,
  getDaysOfMonthViewMetrix,
  getYearRangeLimits,
  validateAndReturnDateFormatter,
  getWeekendInfo,
  isValid,
  isBefore,
} from './date-utils';

import { NATIVE_INDEX_TO_LABEL_MONTHS_MAP } from './constants';

interface Value {
  value: Date;
  year: number;
  month: number;
  date: number;
  formatted: string;
}

type MultiValue = { start: Value; end: Value };

interface Props {
  /**
   * Value of the date in ISO format.
   * Only applicable if selectRange is false
   */
  date?: Date;
  /**
   * Start date of the date range.
   * Only applicable if selectRange is true.
   */
  startdate?: Date;
  /**
   * End date of the date range.
   * Only applicable if selectRange is true.
   */
  endDate?: Date;
  /**
   * Array of weekday number that are part of weekend.
   * The weekday number depends on the start of the week if provided one.
   * By default this is [6, 0] which Saturday, Sunday respectively as per the 0 based start of the week.
   */
  weekends?: WeekdayIndices[];
  /**
   * By default the calendar starts from Sun which is represented in JS as 0 index.
   * You can provide the index for any other day that you want as start of the week.
   */
  startOfWeek?: WeekdayIndices;
  /**
   * Separator to be used when formatting the date string.
   * Default is '-' i.e 'DD-MM-YYYY'
   */
  separator?: string;
  /**
   * A combination of YYYY-MM-DD.
   * Eg. MM-DD-YYYY, DD-MM-YYYY etc.
   * Default is '-' i.e 'DD-MM-YYYY'
   */
  format?: string;
  /**
   * A boolean flag to disable all past dates.
   */
  disablePast?: boolean;
  /**
   * A boolean flag to disable today's date.
   */
  disableToday?: boolean;
  /**
   * A boolean flag to disable all future dates.
   */
  disableFuture?: boolean;
  /**
   * A callback function that can be used to disable specific dates on the calendar.
   */
  isDisabled?: (params: IsDisabledParams) => boolean;
  /**
   * Renders a range selector UI for the calendar
   */
  selectRange?: boolean;
  /**
   * OnChange callback functionn.
   */
  onChange?: (value: Value | MultiValue) => any | Promise<any>;
}

// Add an option to freeze ui if date is invalid
// Add a isEditable option
// Change is in range to could be in range as a class rather than hover

function Calendar({
  date,
  selectRange,
  weekends,
  startdate,
  endDate,
  startOfWeek = 1,
  isDisabled,
  onChange,
  separator = '-',
  format = 'DD-MM-YYYY',
  disableFuture = false,
  disablePast = false,
  disableToday = false,
}: Props) {
  // start day of the week
  const [startOfTheWeek] = useState(startOfWeek);

  const [weekendIndexes] = useState(() => {
    return Array.isArray(weekends) && weekends.every((num) => typeof num === 'number')
      ? weekends
      : getWeekendInfo(startOfTheWeek);
  });

  // current view
  const [view, setView] = useState<'years' | 'months' | 'month_dates'>('month_dates');
  const [monthInView, setMonthInView] = useState<MonthIndices>(
    (isValid(date) ? new Date(date).getMonth() : new Date().getMonth()) as MonthIndices
  );
  const [yearInView, setYearInView] = useState(isValid(date) ? new Date(date).getFullYear() : new Date().getFullYear());

  // selected single date
  const [selectedMonth, setSelectedMonth] = useState(
    (isValid(date) ? new Date(date).getMonth() : new Date().getMonth()) as MonthIndices
  );
  const [selectedDate, setSelectedDate] = useState(isValid(date) ? new Date(date).getDate() : new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(
    isValid(date) ? new Date(date).getFullYear() : new Date().getFullYear()
  );

  // is range select mode on
  const [isRangeSelectModeOn, setIsRangeSelectModeOn] = useState(false);

  // selected range start date
  const [selectedStartMonth, setSelectedStartMonth] = useState(
    (isValid(startdate) ? new Date(startdate).getMonth() : new Date().getMonth()) as MonthIndices
  );
  const [selectedStartDate, setSelectedStartDate] = useState(
    isValid(startdate) ? new Date(startdate).getDate() : new Date().getDate()
  );
  const [selectedStartYear, setSelectedStartYear] = useState(
    isValid(startdate) ? new Date(startdate).getFullYear() : new Date().getFullYear()
  );

  // selected range end date
  const [selectedEndMonth, setSelectedEndMonth] = useState(
    (isValid(endDate) ? new Date(endDate).getMonth() : new Date().getMonth()) as MonthIndices
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    isValid(endDate) ? new Date(endDate).getDate() : new Date().getDate()
  );
  const [selectedEndYear, setSelectedEndYear] = useState(
    isValid(endDate) ? new Date(endDate).getFullYear() : new Date().getFullYear()
  );

  // new range start date
  const [newRangeStartMonth, setNewRangeStartMonth] = useState<undefined | MonthIndices>(selectedStartMonth);
  const [newRangeStartDate, setNewRangeStartDate] = useState<undefined | number>(selectedStartDate);
  const [newRangeStartYear, setNewRangeStartYear] = useState<undefined | number>(selectedStartYear);

  // new range range end date
  const [newRangeEndMonth, setNewRangeEndMonth] = useState<undefined | MonthIndices>(selectedEndMonth);
  const [newRangeEndDate, setNewRangeEndDate] = useState<undefined | number>(selectedEndDate);
  const [newRangeEndYear, setNewRangeEndYear] = useState<undefined | number>(selectedEndYear);

  const [startingYearForCurrRange, setStartingYearForCurrRange] = useState(getStartOfRangeForAYear(yearInView));

  // 1 - 20, 21 - 40
  const [yearMatrixRangeStart, yearMatrixRangeEnd] = useMemo(() => {
    return getYearRangeLimits(startingYearForCurrRange);
  }, [startingYearForCurrRange]);

  // week days as per the start day of the week
  const WEEK_DAYS = useMemo(() => {
    return getWeekDaysIndexToLabelMapForAStartOfTheWeek(startOfTheWeek);
  }, [startOfTheWeek]);

  // date formatter
  const formatter = useMemo(() => {
    return validateAndReturnDateFormatter(format);
  }, [format]);

  useEffect(() => {
    setStartingYearForCurrRange(getStartOfRangeForAYear(yearInView));
  }, [yearInView, setStartingYearForCurrRange]);

  // matrices for different views
  const yearsViewMatrix = useMemo<YearCell[][]>(() => {
    return getYearsViewMetrix(startingYearForCurrRange, selectedYear);
  }, [startingYearForCurrRange, selectedYear]);

  const monthsViewMatrix = useMemo<MonthCell[][]>(() => {
    return getMonthViewMetrix(selectedMonth);
  }, [selectedMonth]);

  const daysOfMMonthViewMatrix = useMemo(() => {
    return getDaysOfMonthViewMetrix({
      newRangeEndYear,
      newRangeEndDate,
      weekendIndexes,
      newRangeEndMonth,
      newRangeStartYear,
      newRangeStartDate,
      newRangeStartMonth,
      isRangeView: !!selectRange,
      isRangeSelectModeOn,
      selectedEndYear,
      selectedEndMonth,
      selectedEndDayOfMonth: selectedEndDate,
      selectedStartDayOfMonth: selectedStartDate,
      selectedStartYear,
      selectedStartMonth,
      yearInView,
      monthInView,
      startOfTheWeek,
      selectedYear,
      selectedMonth,
      selectedDayOfMonth: selectedDate,
      disableFuture,
      disablePast,
      disableToday,
      isDisabled,
    });
  }, [
    newRangeEndYear,
    newRangeEndDate,
    weekendIndexes,
    newRangeEndMonth,
    newRangeStartYear,
    newRangeStartDate,
    newRangeStartMonth,
    selectRange,
    isRangeSelectModeOn,
    selectedEndYear,
    selectedEndMonth,
    selectedEndDate,
    selectedStartDate,
    selectedStartYear,
    selectedStartMonth,
    yearInView,
    monthInView,
    startOfTheWeek,
    selectedYear,
    selectedMonth,
    selectedDate,
    disableFuture,
    disablePast,
    disableToday,
    isDisabled,
  ]);

  // callback handlers
  const onPrevClick = useCallback(
    (e) => {
      if (view === 'month_dates') {
        const isPrevMonthFromLastYear = monthInView === 0;
        if (isPrevMonthFromLastYear) {
          setYearInView(getPreviousYear(yearInView));
        }
        setMonthInView(getPreviousMonth(monthInView));
      }
      if (view === 'years') {
        setStartingYearForCurrRange(getPreviousRangeStartingYear(startingYearForCurrRange));
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

  const onNextClick = useCallback(
    (e) => {
      if (view === 'month_dates') {
        const isCurrentMonthLast = monthInView === 11;
        if (isCurrentMonthLast) {
          setYearInView(getNextYear(yearInView));
        }
        setMonthInView(getNextMonth(monthInView));
      }
      if (view === 'years') {
        setStartingYearForCurrRange(getNextRangeStartingYear(startingYearForCurrRange));
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

  const onDateClicked = useCallback(
    (cell: DayOfMonthCell) => {
      if (selectRange) {
        if (isRangeSelectModeOn) {
          // check if it is the first click or seconds

          const clickedDate = { month: cell.month, monthDate: cell.date, year: cell.year };
          const previouslySelected = {
            month: newRangeStartMonth as MonthIndices,
            monthDate: newRangeStartDate as number,
            year: newRangeStartYear as number,
          };

          if (isBefore(previouslySelected, clickedDate)) {
            setSelectedStartYear(clickedDate.year);
            setSelectedStartMonth(clickedDate.month);
            setSelectedStartDate(clickedDate.monthDate);

            setSelectedEndYear(previouslySelected.year);
            setSelectedEndMonth(previouslySelected.month);
            setSelectedEndDate(previouslySelected.monthDate);

            const startDate = new Date();
            startDate.setDate(clickedDate.monthDate);
            startDate.setFullYear(clickedDate.year);
            startDate.setMonth(clickedDate.month);
            startDate.setMinutes(0, 0, 0);

            const endDate = new Date();
            endDate.setDate(previouslySelected.monthDate);
            endDate.setFullYear(previouslySelected.year);
            endDate.setMonth(previouslySelected.month);
            endDate.setMinutes(0, 0, 0);

            onChange &&
              onChange({
                start: {
                  value: startDate,
                  year: clickedDate.year,
                  month: clickedDate.month,
                  date: clickedDate.monthDate,
                  formatted: formatter(clickedDate.year, clickedDate.month + 1, clickedDate.monthDate, separator),
                },
                end: {
                  value: endDate,
                  year: previouslySelected.year,
                  month: previouslySelected.month,
                  date: previouslySelected.monthDate,
                  formatted: formatter(
                    previouslySelected.year,
                    previouslySelected.month + 1,
                    previouslySelected.monthDate,
                    separator
                  ),
                },
              });
          } else {
            setSelectedStartYear(previouslySelected.year);
            setSelectedStartMonth(previouslySelected.month);
            setSelectedStartDate(previouslySelected.monthDate);

            setSelectedEndYear(clickedDate.year);
            setSelectedEndMonth(clickedDate.month);
            setSelectedEndDate(clickedDate.monthDate);

            const startDate = new Date();
            startDate.setDate(previouslySelected.monthDate);
            startDate.setFullYear(previouslySelected.year);
            startDate.setMonth(previouslySelected.monthDate);
            startDate.setMinutes(0, 0, 0);

            const endDate = new Date();
            endDate.setDate(clickedDate.monthDate);
            endDate.setFullYear(clickedDate.year);
            endDate.setMonth(clickedDate.month);
            endDate.setMinutes(0, 0, 0);

            onChange &&
              onChange({
                start: {
                  value: startDate,
                  year: previouslySelected.year,
                  month: previouslySelected.month,
                  date: previouslySelected.monthDate,
                  formatted: formatter(
                    previouslySelected.year,
                    previouslySelected.month + 1,
                    previouslySelected.monthDate,
                    separator
                  ),
                },
                end: {
                  value: endDate,
                  year: clickedDate.year,
                  month: clickedDate.month,
                  date: clickedDate.monthDate,
                  formatted: formatter(clickedDate.year, clickedDate.month + 1, clickedDate.monthDate, separator),
                },
              });
          }

          setNewRangeEndYear(undefined);
          setNewRangeEndMonth(undefined);
          setNewRangeEndDate(undefined);

          setIsRangeSelectModeOn(false);
        } else {
          // select first date
          setNewRangeStartYear(cell.year);
          setNewRangeStartMonth(cell.month);
          setNewRangeStartDate(cell.date);

          setNewRangeEndYear(undefined);
          setNewRangeEndMonth(undefined);
          setNewRangeEndDate(undefined);

          setIsRangeSelectModeOn(true);
        }
      } else {
        setSelectedMonth(cell.month);
        setSelectedYear(cell.year);
        setSelectedDate(cell.date);
        const date = new Date();
        date.setFullYear(cell.year);
        date.setMonth(cell.month);
        date.setDate(cell.date);
        date.setMinutes(0, 0, 0);

        onChange &&
          onChange({
            value: date,
            year: cell.year,
            month: cell.month,
            date: cell.date,
            formatted: formatter(cell.year, cell.month + 1, cell.date, separator),
          });
      }

      setMonthInView(cell.month);
      setYearInView(cell.year);
    },
    [
      selectRange,
      isRangeSelectModeOn,
      newRangeStartMonth,
      newRangeStartDate,
      newRangeStartYear,
      onChange,
      formatter,
      separator,
    ]
  );

  return (
    <section className='arc'>
      <header className='arc_header'>
        <button className='arc_header_nav arc_header_nav-prev' onClick={onPrevClick}>
          ←
        </button>
        {view === 'month_dates' ? (
          <button className='arc_header_label arc_header_label-days-of-month' onClick={() => setView('years')}>
            <div>
              <span>{NATIVE_INDEX_TO_LABEL_MONTHS_MAP[monthInView]}</span>
            </div>
            <div>
              <span>{yearInView}</span>
            </div>
          </button>
        ) : view === 'months' ? (
          <button className='arc_header_label arc_header_label-months'>
            <div onClick={() => setView('years')}>
              <span>{yearInView}</span>
            </div>
          </button>
        ) : (
          <button className='arc_header_label arc_header_label-years' onClick={() => setView('month_dates')}>
            <div>
              <span>
                {yearMatrixRangeStart}-{yearMatrixRangeEnd}
              </span>
            </div>
          </button>
        )}
        <button className='arc_header_nav arc_header_nav-next' onClick={onNextClick}>
          →
        </button>
      </header>
      <main className='arc_view'>
        {view === 'months' && (
          <div className='arc_view-months'>
            {monthsViewMatrix.map((row, index) => (
              <div className='arc_view_row' key={index}>
                {row.map((cell) => (
                  <div className={`arc_view_cell${cell.isCurrentMonth ? ' arc_this_month' : ''}`} key={cell.month}>
                    <button
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
            {yearsViewMatrix.map((row, index) => (
              <div className='arc_view_row' key={index}>
                {row.map((cell) => (
                  <div className={`arc_view_cell${cell.isCurrentYear ? ' arc_this_year' : ''}`} key={cell.year}>
                    <button
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
                    typeof weekendIndexes.find((weekend) => weekend === Number(weekDay)) === 'number' ? ' arc_wknd' : ''
                  }`}>
                  <span>{WEEK_DAYS[Number(weekDay) as WeekdayIndices]}</span>
                </li>
              ))}
            </ul>
            <div className='arc_view-days-of-month' role='grid'>
              {daysOfMMonthViewMatrix.map((row, index) => (
                <div className='arc_view_row' key={index}>
                  {row.map((cell) => (
                    <div
                      onMouseEnter={() => {
                        if (selectRange) {
                          if (isRangeSelectModeOn) {
                            setNewRangeEndYear(cell.year);
                            setNewRangeEndMonth(cell.month);
                            setNewRangeEndDate(cell.date);
                          }
                        }
                      }}
                      key={cell.date}
                      className={`arc_view_cell${cell.activeMonthInView ? ' arc_active' : ''}${
                        cell.isWeekend ? ' arc_wknd' : ''
                      }${cell.isToday ? ' arc_today' : ''}${cell.isFirstRow ? ' arc_fr' : ''}${
                        cell.isLastRow ? ' arc_lr' : ''
                      }${cell.isFirsColumn ? ' arc_fc' : ''}${cell.isLastColumn ? ' arc_lc' : ''}${
                        cell.isSelected && !selectRange ? ' arc_selected' : ''
                      }${cell.isDisabled ? ' arc_disabled' : ''}${cell.isInRange ? ' arc_in_range' : ''}${
                        cell.isRangeStart ? ' arc_range_start' : ''
                      }${cell.isRangeEnd ? ' arc_range_end' : ''}${isRangeSelectModeOn ? ' arc_range_mode' : ''}`}>
                      <div className='arc_view_cell_value'>
                        <button
                          disabled={cell.isDisabled}
                          tabIndex={cell.isDisabled ? -1 : 0}
                          onClick={() => onDateClicked(cell)}>
                          {cell.date}
                        </button>
                      </div>
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
