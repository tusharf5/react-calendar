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
  toString,
  addDays,
} from './date-utils';

import { NATIVE_INDEX_TO_LABEL_MONTHS_MAP } from './constants';

interface Value {
  value: Date;
  formatted: string;
}

type RangeValue = [Value, Value];
type MultiValue = Value[];

interface Props {
  /**
   * The initial month and year that will be shown to the user.
   * By default it shows today's date month and year. If a date is selected it shows the selected
   * date's month and year.
   */
  initialViewDate?: Date;
  /**
   * Value of the date in ISO format.
   * Only applicable if selectRange is false
   */
  date?: Date;
  /**
   * Multiple dates
   */
  dates?: Date[];
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
   * Always select n number of days starting from the user's selected date
   */
  fixedRange?: number;
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
   * User will not be able to select past this date. This date will be selectable.
   */
  maxAllowedDate?: Date;
  /**
   * User will not be able to select before this date. This date will be selectable.
   */
  minAllowedDate?: Date;
  /**
   * Renders a range selector UI for the calendar
   */
  selectRange?: boolean;
  /**
   * Renders a multi date selector UI for the calendar
   */
  selectMultiDates?: boolean;
  /**
   * OnChange callback functionn.
   */
  onChange?: (value: Value | MultiValue | RangeValue) => any | Promise<any>;
}

// Add an option to freeze ui if date is invalid
// Add a isEditable option
// Change is in range to could be in range as a class rather than hover
// dont show range hover on diabalbed

function Calendar({
  date,
  dates = [],
  selectRange,
  weekends,
  startdate,
  initialViewDate,
  endDate,
  startOfWeek = 1,
  maxAllowedDate,
  minAllowedDate,
  selectMultiDates,
  fixedRange,
  isDisabled,
  onChange,
  separator = '-',
  format = 'DD-MM-YYYY',
  disableFuture = false,
  disablePast = false,
  disableToday = false,
}: Props) {
  // range takes precedence over multi select
  const [isSelectMultiDate] = useState(
    typeof selectMultiDates === 'boolean' && !selectRange ? selectMultiDates : false
  );

  const [isFixedRange] = useState(
    !isSelectMultiDate && !selectRange && typeof fixedRange === 'number' && fixedRange > 1 ? true : false
  );

  // is range select mode on
  const [isRangeSelectModeOn, setIsRangeSelectModeOn] = useState(false);

  const [fixedRangeLength] = useState(isFixedRange ? (fixedRange as number) : 1);

  // start day of the week
  const [startOfTheWeek] = useState(startOfWeek);

  // maxDate
  const [maxDate] = useState(() => {
    return isValid(maxAllowedDate) ? maxAllowedDate : new Date();
  });
  const [applyMaxConstraint] = useState(() => {
    return isValid(maxAllowedDate)
      ? isValid(minAllowedDate)
        ? isBefore(maxAllowedDate, minAllowedDate)
        : true
      : false;
  });

  // minDate
  const [minDate] = useState(() => {
    return isValid(minAllowedDate) ? minAllowedDate : new Date();
  });

  const [applyminConstraint] = useState(() => {
    return isValid(minAllowedDate)
      ? isValid(maxAllowedDate)
        ? isBefore(maxAllowedDate, minAllowedDate)
        : true
      : false;
  });

  const [weekendIndexes] = useState(() => {
    return Array.isArray(weekends) && weekends.every((num) => typeof num === 'number')
      ? weekends
      : getWeekendInfo(startOfTheWeek);
  });

  // current view
  const [view, setView] = useState<'years' | 'months' | 'month_dates'>('month_dates');
  const [monthInView, setMonthInView] = useState<MonthIndices>(
    (isValid(initialViewDate)
      ? new Date(initialViewDate).getMonth()
      : !selectRange && isValid(date)
      ? new Date(date).getMonth()
      : new Date().getMonth()) as MonthIndices
  );
  const [yearInView, setYearInView] = useState(
    isValid(initialViewDate)
      ? new Date(initialViewDate).getFullYear()
      : !selectRange && isValid(date)
      ? new Date(date).getFullYear()
      : new Date().getFullYear()
  );

  // selected multi dates
  const [selectedMultiDates, setSelectedMultiDates] = useState<Record<string, Date | undefined>>(
    dates.reduce((acc, currDate) => {
      if (isValid(currDate)) {
        acc[toString(currDate)] = currDate;
      }
      return acc;
    }, {} as Record<string, Date | undefined>)
  );

  // selected single date
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    if (isValid(date)) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const dateOfMonth = date.getDate();
      return new Date(year, month, dateOfMonth);
    } else {
      return today;
    }
  });

  // selected range start date
  const [selectedRangeStart, setSelectedRangeStart] = useState(() => {
    const today = new Date();
    if (!!selectRange && isValid(startdate)) {
      const year = startdate.getFullYear();
      const month = startdate.getMonth();
      const date = startdate.getDate();

      return new Date(year, month, date);
    } else {
      return today;
    }
  });

  const [selectedRangeEnd, setSelectedRangeEnd] = useState(() => {
    const today = new Date();
    // FIXME Check if endDAte is after startDAte
    if (!!selectRange && isValid(endDate)) {
      const year = endDate.getFullYear();
      const month = endDate.getMonth();
      const date = endDate.getDate();
      return new Date(year, month, date);
    } else if (isFixedRange) {
      return addDays(selectedRangeStart, fixedRangeLength);
    } else {
      return today;
    }
  });

  const [newSelectedRangeStart, setNewSelectedRangeStart] = useState<Date | undefined>(() => {
    return selectedRangeStart;
  });

  const [newSelectedRangeEnd, setNewSelectedRangeEnd] = useState<Date | undefined>(() => {
    return selectedRangeEnd;
  });

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
    return getYearsViewMetrix(startingYearForCurrRange, selectedDate.getFullYear());
  }, [startingYearForCurrRange, selectedDate]);

  const monthsViewMatrix = useMemo<MonthCell[][]>(() => {
    return getMonthViewMetrix(selectedDate.getMonth());
  }, [selectedDate]);

  const daysOfMMonthViewMatrix = useMemo(() => {
    return getDaysOfMonthViewMetrix({
      selectedDate: selectedDate,
      selectedRangeStart: selectedRangeStart,
      selectedRangeEnd: selectedRangeEnd,
      newSelectedRangeStart: newSelectedRangeStart,
      newSelectedRangeEnd: newSelectedRangeEnd,
      isRangeView: !!selectRange || isFixedRange,
      isRangeSelectModeOn,
      weekendIndexes,
      selectedMultiDates,
      isSelectMultiDate,
      yearInView,
      monthInView,
      startOfTheWeek,
      disableFuture,
      disablePast,
      disableToday,
      isDisabled,
      maxDate: maxDate,
      minDate: minDate,
      applyMax: applyMaxConstraint,
      applyMin: applyminConstraint,
    });
  }, [
    selectedDate,
    selectedRangeStart,
    selectedRangeEnd,
    newSelectedRangeStart,
    newSelectedRangeEnd,
    selectRange,
    isFixedRange,
    isRangeSelectModeOn,
    weekendIndexes,
    selectedMultiDates,
    isSelectMultiDate,
    yearInView,
    monthInView,
    startOfTheWeek,
    disableFuture,
    disablePast,
    disableToday,
    isDisabled,
    maxDate,
    minDate,
    applyMaxConstraint,
    applyminConstraint,
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
      const clickedDate = new Date(cell.year, cell.month, cell.date);

      if (selectRange) {
        if (isRangeSelectModeOn && newSelectedRangeStart) {
          // check if it is the first click or seconds

          const previouslySelectedDate = new Date(
            newSelectedRangeStart.getFullYear(),
            newSelectedRangeStart.getMonth(),
            newSelectedRangeStart.getDate()
          );

          if (isBefore(previouslySelectedDate, clickedDate)) {
            setSelectedRangeStart(clickedDate);
            setSelectedRangeEnd(previouslySelectedDate);

            const startDate = clickedDate;

            const endDate = previouslySelectedDate;

            onChange &&
              onChange([
                {
                  value: startDate,
                  formatted: formatter(
                    startDate.getFullYear(),
                    startDate.getMonth() + 1,
                    startDate.getDate(),
                    separator
                  ),
                },
                {
                  value: endDate,
                  formatted: formatter(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), separator),
                },
              ]);
          } else {
            setSelectedRangeStart(previouslySelectedDate);

            setSelectedRangeEnd(clickedDate);

            const startDate = previouslySelectedDate;

            const endDate = clickedDate;

            onChange &&
              onChange([
                {
                  value: startDate,
                  formatted: formatter(
                    startDate.getFullYear(),
                    startDate.getMonth() + 1,
                    startDate.getDate(),
                    separator
                  ),
                },
                {
                  value: endDate,
                  formatted: formatter(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), separator),
                },
              ]);
          }

          setNewSelectedRangeEnd(undefined);

          setIsRangeSelectModeOn(false);
        } else {
          // select first date
          setNewSelectedRangeStart(clickedDate);

          setNewSelectedRangeEnd(undefined);

          setIsRangeSelectModeOn(true);
        }
      } else if (isSelectMultiDate) {
        const date = new Date(cell.year, cell.month, cell.date);
        const stringkey = toString(date);

        const newselectedMultiDates = { ...selectedMultiDates };

        if (!!selectedMultiDates[stringkey]) {
          newselectedMultiDates[stringkey] = undefined;
        } else {
          newselectedMultiDates[stringkey] = date;
        }

        setSelectedMultiDates(newselectedMultiDates);

        onChange &&
          onChange(
            Object.keys(newselectedMultiDates)
              .filter((dk) => !!newselectedMultiDates[dk])
              .map((dk) => ({
                value: newselectedMultiDates[dk] as Date,
                year: (newselectedMultiDates[dk] as Date).getFullYear(),
                month: (newselectedMultiDates[dk] as Date).getMonth(),
                date: (newselectedMultiDates[dk] as Date).getDate(),
                formatted: formatter(
                  (newselectedMultiDates[dk] as Date).getFullYear(),
                  (newselectedMultiDates[dk] as Date).getMonth() + 1,
                  (newselectedMultiDates[dk] as Date).getDate(),
                  separator
                ),
              }))
          );
      } else if (isFixedRange) {
        setSelectedRangeStart(clickedDate);
        const endDate = addDays(clickedDate, fixedRangeLength);
        setSelectedRangeEnd(endDate);
        onChange &&
          onChange([
            {
              value: clickedDate,
              formatted: formatter(
                clickedDate.getFullYear(),
                clickedDate.getMonth() + 1,
                clickedDate.getDate(),
                separator
              ),
            },
            {
              value: endDate,
              formatted: formatter(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), separator),
            },
          ]);
      } else {
        setSelectedDate(clickedDate);

        onChange &&
          onChange({
            value: clickedDate,
            formatted: formatter(
              clickedDate.getFullYear(),
              clickedDate.getMonth() + 1,
              clickedDate.getDate(),
              separator
            ),
          });
      }

      setMonthInView(cell.month);
      setYearInView(cell.year);
    },
    [
      selectRange,
      isSelectMultiDate,
      isFixedRange,
      isRangeSelectModeOn,
      newSelectedRangeStart,
      onChange,
      formatter,
      separator,
      selectedMultiDates,
      fixedRangeLength,
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
                            setNewSelectedRangeEnd(new Date(cell.year, cell.month, cell.date));
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
