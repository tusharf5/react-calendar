import React, { useCallback, useEffect, useMemo, useState, CSSProperties } from 'react';

import type { IsDisabledParams, MonthIndices, WeekdayIndices } from './types';

import {
  getStartOfRangeForAYear,
  getPreviousYear,
  getPreviousMonth,
  getPreviousRangeStartingYear,
  getNextYear,
  getNextMonth,
  getNextRangeStartingYear,
  getYearRangeLimits,
  getWeekendInfo,
  isValid,
  isBefore,
  toString,
  addDays,
} from './utils/date-utils';

import { Header } from './components/header/Header';
import { MonthSelector } from './components/month-selector/MonthSelector';
import { YearSelector } from './components/year-selector/YearSelector';
import { WeekDaysRow } from './components/week-days-row/WeekDaysRow';
import { DayOfMonthSelector } from './components/day-of-month-selector/DayOfMonthSelector';

interface Value {
  value: Date;
  formatted: string;
}

type RangeValue = [Value, Value];
type MultiValue = Value[];

interface Props {
  /**
   * Width & Height of the calendar.
   * Default is 276
   */
  size?: number;
  /**
   * The initial month and year that will be shown to the user.
   * By default it shows today's date month and year. If a date is selected it shows the selected
   * date's month and year.
   */
  initialViewDate?: Date;
  /**
   * Value of a single date or an array of dates in ISO format.
   * Only applicable if selectRange is false
   */
  value?: Date | Date[];
  /**
   * Renders a multiple dates selector view
   */
  isMultiSelector?: boolean;
  /**
   * Renders a range selector UI for the calendar
   */
  isRangeSelector?: boolean;
  /**
   * Calendar takes the total width and height of the parent.
   */
  isFluid?: boolean;
  /**
   * Always select n number of days starting from the user's selected date
   */
  fixedRange?: number;
  /**
   * Start date of the date range.
   * Only applicable if selectRange is true.
   */
  rangeStart?: Date;
  /**
   * End date of the date range.
   * Only applicable if selectRange is true.
   */
  rangeEnd?: Date;
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
   * User will not be able to select past this date. This date will be selectable.
   */
  maxAllowedDate?: Date;
  /**
   * User will not be able to select before this date. This date will be selectable.
   */
  minAllowedDate?: Date;
  /**
   * These dates will be highlighted
   */
  highlights?: Date[];
  /**
   * OnChange callback functionn.
   */
  onChange?: (value: Value | MultiValue | RangeValue) => any | Promise<any>;
}

// const getStyles: (size: number) => ComputedStyles = (size: number) => ({
//   appliedWidth: `${size!}px`,
//   appliedHeight: `${size!}px`,
//   headerHeightPercent: '14.65%',
//   bodyHeightPercent: '85.35%',
//   weekdaysRowBottomMarginPercent: '3.26%',
//   weekdayColumnCellLeftMarginPercent: '2.17%',
//   weekdayColumnCellWidthPercent: '12.736%',
//   dayOfMonthViewHeightPercent: '82.179%',
//   weekdaysRowHeightPercent: '14.001%',
//   dayOfMonthRowHeightPercent: '16.664%',
//   dayOfMonthColumnWidthPercent: '14.286%',
//   monthRowHeightPercent: '24.9%',
//   monthColumnWidthPercent: '33.33%',
//   yearRowHeightPercent: '24.9%',
//   yearColumnWidthPercent: '20%',
// });

const getStyles: (size: number) => CSSProps = (size) => ({
  root: {
    arc: { width: `${size!}px`, height: `${size!}px` },
    arc_view: { height: '85.35%' },
  },
  weekdaysRow: {
    arc_view_weekdays: {
      height: '14.001%',
      marginBottom: '3.26%',
    },
    arc_view_weekdays_cell: {
      flexBasis: '12.736%',
      maxWidth: '12.736%',
      // TODO add index === 0 || index === 6 ? 0 :
      marginLeft: '2.17%',
    },
  },
  dayOfMonth: {
    'arc_view-days-of-month': { height: '82.179%' },
    arc_view_row: { height: '16.664%' },
    arc_view_cell: {
      flexBasis: '14.286%',
      maxWidth: '14.286%',
    },
  },
  months: {
    arc_view_row: { height: '24.9%' },
    arc_view_cell: { flexBasis: '33.33%', maxWidth: '33.33%' },
  },
  years: {
    arc_view_row: { height: '24.9%' },
    arc_view_cell: { width: '20%' },
  },
  header: {
    arc_header: { height: '14.65%', padding: '2.50%' },
    arc_header_nav: { width: '10.14%', height: '100%' },
    arch_header_label: { width: '65.21%', height: '100%', margin: '0 4.34%' },
  },
});

// Add an option to freeze ui if date is invalid
// Add a isEditable option
// Change is in range to could be in range as a class rather than hover
// dont show range hover on diabalbed

function Calendar({
  value,
  isMultiSelector,
  isRangeSelector,
  weekends,
  highlights = [],
  rangeStart: rangeStartValue,
  initialViewDate,
  rangeEnd: rangeEndValue,
  startOfWeek = 1,
  maxAllowedDate,
  minAllowedDate,
  fixedRange,
  isDisabled,
  onChange,
  separator = '-',
  format = 'DD-MM-YYYY',
  disableFuture = false,
  size = 276,
  disablePast = false,
  disableToday = false,
}: Props) {
  const styles = useMemo(() => getStyles(size), [size]);

  const [today] = useState(new Date());

  const [isRangeSelectorView] = useState(!!isRangeSelector);

  const [isMultiSelectorView] = useState(!isRangeSelectorView && !!isMultiSelector);

  const [isFixedRangeView] = useState(
    isRangeSelectorView && typeof fixedRange === 'number' && fixedRange > 0 ? true : false
  );

  const [isNormalView] = useState(!isRangeSelectorView && !isMultiSelectorView);

  // is range select mode on
  const [isRangeSelectModeOn, setIsRangeSelectModeOn] = useState(false);

  if (isNormalView && Array.isArray(value)) {
    throw new Error('`value` should an instance of the Date class. Provided value is an Array.');
  }

  const [fixedRangeLength] = useState(isFixedRangeView ? (fixedRange as number) : 1);

  // start day of the week
  const [startOfTheWeek] = useState(startOfWeek);

  const [weekendIndexes] = useState(() => {
    return Array.isArray(weekends) && weekends.every((num) => typeof num === 'number')
      ? weekends
      : getWeekendInfo(startOfTheWeek);
  });

  // selected single date
  const [selectedDate, setSelectedDate] = useState(() => {
    if (isNormalView && isValid(value as Date)) {
      const year = (value as Date).getFullYear();
      const month = (value as Date).getMonth();
      const dateOfMonth = (value as Date).getDate();
      return new Date(year, month, dateOfMonth);
    } else {
      return today;
    }
  });

  // selected multi dates
  const [selectedMultiDates, setSelectedMultiDates] = useState<Record<string, Date | undefined>>(() => {
    if (isMultiSelectorView && Array.isArray(value) && value.every(isValid)) {
      return value.reduce((acc, currDate) => {
        if (isValid(currDate)) {
          acc[toString(currDate)] = currDate;
        }
        return acc;
      }, {} as Record<string, Date | undefined>);
    } else {
      return {} as Record<string, Date | undefined>;
    }
  });

  // selected range start date
  const [selectedRangeStart, setSelectedRangeStart] = useState(() => {
    if (isRangeSelectorView && isValid(rangeStartValue)) {
      const year = rangeStartValue.getFullYear();
      const month = rangeStartValue.getMonth();
      const date = rangeStartValue.getDate();
      return new Date(year, month, date);
    } else {
      return today;
    }
  });

  const [selectedRangeEnd, setSelectedRangeEnd] = useState(() => {
    if (isRangeSelectorView && isValid(rangeEndValue) && isBefore(rangeEndValue, selectedRangeStart)) {
      const year = rangeEndValue.getFullYear();
      const month = rangeEndValue.getMonth();
      const date = rangeEndValue.getDate();
      return new Date(year, month, date);
    } else if (isFixedRangeView) {
      return addDays(selectedRangeStart, fixedRangeLength);
    } else {
      return addDays(selectedRangeStart, 2);
    }
  });

  const [newSelectedRangeStart, setNewSelectedRangeStart] = useState<Date | undefined>(() => {
    return selectedRangeStart;
  });

  const [newSelectedRangeEnd, setNewSelectedRangeEnd] = useState<Date | undefined>(() => {
    return selectedRangeEnd;
  });

  // View States
  const [view, setView] = useState<'years' | 'months' | 'month_dates'>('month_dates');

  const [monthInView, setMonthInView] = useState<MonthIndices>(
    (isValid(initialViewDate)
      ? initialViewDate.getMonth()
      : isNormalView && isValid(value as Date)
      ? (value as Date).getMonth()
      : isRangeSelectorView
      ? selectedRangeStart.getMonth()
      : today.getMonth()) as MonthIndices
  );

  const [yearInView, setYearInView] = useState(
    isValid(initialViewDate)
      ? initialViewDate.getFullYear()
      : isNormalView && isValid(value as Date)
      ? (value as Date).getFullYear()
      : isRangeSelectorView
      ? selectedRangeStart.getFullYear()
      : today.getFullYear()
  );

  const [startingYearForCurrRange, setStartingYearForCurrRange] = useState(getStartOfRangeForAYear(yearInView));

  useEffect(() => {
    setStartingYearForCurrRange(getStartOfRangeForAYear(yearInView));
  }, [yearInView, setStartingYearForCurrRange]);

  // 1 - 20, 21 - 40
  const [yearMatrixRangeStart, yearMatrixRangeEnd] = useMemo(() => {
    return getYearRangeLimits(startingYearForCurrRange);
  }, [startingYearForCurrRange]);

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

  return (
    <section style={styles.root.arc} className='arc'>
      <Header
        layoutCalcs={styles}
        onClickPrev={onPrevClick}
        onClickNext={onNextClick}
        onChangeViewType={setView}
        viewType={view}
        viewingMonth={monthInView}
        viewingYear={yearInView}
        yearMatrixStart={yearMatrixRangeStart}
        yearMatrixEnd={yearMatrixRangeEnd}
      />
      <main style={styles.root.arc_view} className='arc_view'>
        {view === 'months' && (
          <MonthSelector layoutCalcs={styles} onChangeViewType={setView} onChangeViewingMonth={setMonthInView} />
        )}
        {view === 'years' && (
          <YearSelector
            layoutCalcs={styles}
            onChangeViewType={setView}
            onChangeViewingYear={setYearInView}
            yearMatrixStart={yearMatrixRangeStart}
            yearMatrixEnd={yearMatrixRangeEnd}
          />
        )}
        {view === 'month_dates' && (
          <>
            <WeekDaysRow layoutCalcs={styles} weekStartIndex={startOfTheWeek} weekendIndices={weekendIndexes} />
            <DayOfMonthSelector
              isRangeSelectModeOn={isRangeSelectModeOn}
              setIsRangeSelectModeOn={setIsRangeSelectModeOn}
              layoutCalcs={styles}
              selectedDate={selectedDate}
              selectedRangeStart={selectedRangeStart}
              selectedRangeEnd={selectedRangeEnd}
              newSelectedRangeStart={newSelectedRangeStart}
              weekStartIndex={startOfTheWeek}
              onChangeViewingYear={setYearInView}
              onChangeViewingMonth={setMonthInView}
              onChangenSelectedMultiDates={setSelectedMultiDates}
              onChangenNewSelectedRangeEnd={setNewSelectedRangeEnd}
              onChangenNewSelectedRangeStart={setNewSelectedRangeStart}
              onChangenSelectedRangeEnd={setSelectedRangeEnd}
              onChangenSelectedRangeStart={setSelectedRangeStart}
              onChangenSelectedDate={setSelectedDate}
              newSelectedRangeEnd={newSelectedRangeEnd}
              isRangeSelectorView={isRangeSelectorView}
              fixedRangeLength={fixedRangeLength}
              isFixedRangeView={isFixedRangeView}
              isDisabled={isDisabled}
              selectedMultiDates={selectedMultiDates}
              isMultiSelectorView={isMultiSelectorView}
              viewingMonth={monthInView}
              format={format}
              today={today}
              maxAllowedDate={maxAllowedDate}
              minAllowedDate={minAllowedDate}
              weekendIndices={weekendIndexes}
              onChange={onChange}
              viewingYear={yearInView}
              disableFuture={disableFuture}
              disablePast={disablePast}
              separator={separator}
              highlights={highlights}
              disableToday={disableToday}
            />
          </>
        )}
      </main>
    </section>
  );
}

export default Calendar;

export interface CSSProps {
  root: {
    arc: CSSProperties;
    arc_view: CSSProperties;
  };
  weekdaysRow: {
    arc_view_weekdays: CSSProperties;
    arc_view_weekdays_cell: CSSProperties;
  };
  dayOfMonth: {
    'arc_view-days-of-month': CSSProperties;
    arc_view_row: CSSProperties;
    arc_view_cell: CSSProperties;
  };
  months: {
    arc_view_row: CSSProperties;
    arc_view_cell: CSSProperties;
  };
  years: {
    arc_view_row: CSSProperties;
    arc_view_cell: CSSProperties;
  };
  header: {
    arc_header: CSSProperties;
    arc_header_nav: CSSProperties;
    arch_header_label: CSSProperties;
  };
}
