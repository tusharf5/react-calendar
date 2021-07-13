import React, { memo, useCallback, useMemo, useState } from 'react';

import { DayOfMonthCell, IsDisabledParams, MonthIndices, WeekdayIndices } from '../../types';
import {
  addDays,
  getDaysOfMonthViewMetrix,
  isBefore,
  isValid,
  toString,
  validateAndReturnDateFormatter,
} from '../../utils/date-utils';

interface Value {
  value: Date;
  formatted: string;
}

type RangeValue = [Value, Value];
type MultiValue = Value[];

interface Props {
  onChangeViewingYear: (year: number) => any;
  onChangeViewingMonth: (month: MonthIndices) => any;
  onChangenNewSelectedRangeEnd: (date: Date | undefined) => any;
  onChangenNewSelectedRangeStart: (date: Date | undefined) => any;
  onChangenSelectedRangeStart: (date: Date) => any;
  onChangenSelectedRangeEnd: (date: Date) => any;
  onChangenSelectedMultiDates: (dates: Record<string, Date | undefined>) => any;
  onChangenSelectedDate: (dates: Date) => any;
  viewingMonth: MonthIndices;
  viewingYear: number;
  fixedRangeLength: number;
  weekStartIndex: WeekdayIndices;
  selectedDate: Date;
  selectedRangeStart: Date;
  selectedRangeEnd: Date;
  newSelectedRangeStart: Date | undefined;
  newSelectedRangeEnd: Date | undefined;
  isRangeSelectorView: boolean;
  isFixedRangeView: boolean;
  weekendIndices: WeekdayIndices[];
  selectedMultiDates: Record<string, Date | undefined>;
  isMultiSelectorView: boolean;
  disableFuture: boolean;
  disablePast: boolean;
  disableToday: boolean;
  maxAllowedDate?: Date;
  minAllowedDate?: Date;
  separator?: string;
  highlights: Date[];
  isDisabled?: (params: IsDisabledParams) => boolean;
  /**
   * A combination of YYYY-MM-DD.
   * Eg. MM-DD-YYYY, DD-MM-YYYY etc.
   * Default is '-' i.e 'DD-MM-YYYY'
   */
  format?: string;
  today: Date;
  onChange?: (value: Value | MultiValue | RangeValue) => any | Promise<any>;
}

function DayOfMonthSelectorComponent({
  selectedDate,
  selectedRangeStart,
  selectedRangeEnd,
  newSelectedRangeStart,
  weekStartIndex,
  onChangeViewingYear,
  onChangeViewingMonth,
  newSelectedRangeEnd,
  isRangeSelectorView,
  fixedRangeLength,
  isFixedRangeView,
  isDisabled,
  onChangenSelectedMultiDates,
  selectedMultiDates,
  isMultiSelectorView,
  viewingMonth,
  format,
  onChangenNewSelectedRangeEnd,
  onChangenNewSelectedRangeStart,
  onChangenSelectedRangeEnd,
  onChangenSelectedRangeStart,
  today,
  onChangenSelectedDate,
  maxAllowedDate,
  minAllowedDate,
  weekendIndices,
  onChange,
  viewingYear,
  disableFuture,
  disablePast,
  separator = '-',
  highlights,
  disableToday,
}: Props) {
  // is range select mode on
  const [isRangeSelectModeOn, setIsRangeSelectModeOn] = useState(false);

  const [highlightsMap] = useState<Record<string, 1>>(() => {
    if (Array.isArray(highlights)) {
      return highlights
        .filter((d) => isValid(d))
        .reduce((acc, curr) => {
          acc[toString(curr)] = 1;
          return acc;
        }, {} as Record<string, 1>);
    }
    return {};
  });

  // date formatter
  const formatter = useMemo(() => {
    return validateAndReturnDateFormatter(format || 'DD-MM-YYYY');
  }, [format]);

  // max allowed Date
  const [maxDate] = useState(() => {
    return isValid(maxAllowedDate) ? maxAllowedDate : today;
  });
  const [applyMaxConstraint] = useState(() => {
    return isValid(maxAllowedDate)
      ? isValid(minAllowedDate)
        ? isBefore(maxAllowedDate, minAllowedDate)
        : true
      : false;
  });

  // min allowed Date
  const [minDate] = useState(() => {
    return isValid(minAllowedDate) ? minAllowedDate : today;
  });

  const [applyminConstraint] = useState(() => {
    return isValid(minAllowedDate)
      ? isValid(maxAllowedDate)
        ? isBefore(maxAllowedDate, minAllowedDate)
        : true
      : false;
  });

  const daysOfMMonthViewMatrix = useMemo(() => {
    return getDaysOfMonthViewMetrix({
      selectedDate: selectedDate,
      selectedRangeStart: selectedRangeStart,
      selectedRangeEnd: selectedRangeEnd,
      newSelectedRangeStart: newSelectedRangeStart,
      newSelectedRangeEnd: newSelectedRangeEnd,
      isRangeView: isRangeSelectorView || isFixedRangeView,
      isRangeSelectModeOn,
      weekendIndexes: weekendIndices,
      selectedMultiDates,
      highlightsMap,
      isSelectMultiDate: isMultiSelectorView,
      yearInView: viewingYear,
      monthInView: viewingMonth,
      startOfTheWeek: weekStartIndex,
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
    isRangeSelectorView,
    isFixedRangeView,
    isRangeSelectModeOn,
    weekendIndices,
    selectedMultiDates,
    highlightsMap,
    isMultiSelectorView,
    viewingYear,
    viewingMonth,
    weekStartIndex,
    disableFuture,
    disablePast,
    disableToday,
    isDisabled,
    maxDate,
    minDate,
    applyMaxConstraint,
    applyminConstraint,
  ]);

  const onDateClicked = useCallback(
    (cell: DayOfMonthCell) => {
      const clickedDate = new Date(cell.year, cell.month, cell.date);

      if (isRangeSelectorView && !isFixedRangeView) {
        if (isRangeSelectModeOn && newSelectedRangeStart) {
          // check if it is the first click or seconds

          const previouslySelectedDate = new Date(
            newSelectedRangeStart.getFullYear(),
            newSelectedRangeStart.getMonth(),
            newSelectedRangeStart.getDate()
          );

          if (isBefore(previouslySelectedDate, clickedDate)) {
            onChangenSelectedRangeStart(clickedDate);
            onChangenSelectedRangeEnd(previouslySelectedDate);

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
            onChangenSelectedRangeStart(previouslySelectedDate);

            onChangenSelectedRangeEnd(clickedDate);

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

          onChangenNewSelectedRangeEnd(undefined);

          setIsRangeSelectModeOn(false);
        } else {
          // select first date
          onChangenNewSelectedRangeStart(clickedDate);

          onChangenNewSelectedRangeEnd(undefined);

          setIsRangeSelectModeOn(true);
        }
      } else if (isFixedRangeView) {
        onChangenSelectedRangeStart(clickedDate);
        const endDate = addDays(clickedDate, fixedRangeLength);
        onChangenSelectedRangeEnd(endDate);
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
      } else if (isMultiSelectorView) {
        const date = new Date(cell.year, cell.month, cell.date);
        const stringkey = toString(date);

        const newselectedMultiDates = { ...selectedMultiDates };

        if (!!selectedMultiDates[stringkey]) {
          newselectedMultiDates[stringkey] = undefined;
        } else {
          newselectedMultiDates[stringkey] = date;
        }

        onChangenSelectedMultiDates(newselectedMultiDates);

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
      } else {
        onChangenSelectedDate(clickedDate);

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

      onChangeViewingMonth(cell.month);
      onChangeViewingYear(cell.year);
    },
    [
      isRangeSelectorView,
      isFixedRangeView,
      isMultiSelectorView,
      onChangeViewingMonth,
      onChangeViewingYear,
      isRangeSelectModeOn,
      newSelectedRangeStart,
      onChangenNewSelectedRangeEnd,
      onChangenSelectedRangeStart,
      onChangenSelectedRangeEnd,
      onChange,
      formatter,
      separator,
      onChangenNewSelectedRangeStart,
      fixedRangeLength,
      selectedMultiDates,
      onChangenSelectedMultiDates,
      onChangenSelectedDate,
    ]
  );

  return (
    <div className='arc_view-days-of-month' role='grid'>
      {daysOfMMonthViewMatrix.map((row, index) => (
        <div className='arc_view_row' key={index}>
          {row.map((cell) => (
            <div
              onMouseEnter={() => {
                if (isRangeSelectorView) {
                  if (isRangeSelectModeOn) {
                    onChangenNewSelectedRangeEnd(new Date(cell.year, cell.month, cell.date));
                  }
                }
              }}
              key={cell.date}
              className={`arc_view_cell${cell.activeMonthInView ? ' arc_active' : ''}${
                cell.isWeekend ? ' arc_wknd' : ''
              }${cell.isToday ? ' arc_today' : ''}${cell.isFirstRow ? ' arc_fr' : ''}${
                cell.isToday ? ' arc_today' : ''
              }${cell.isHighlight ? ' arc_highlight' : ''}${cell.isLastRow ? ' arc_lr' : ''}${
                cell.isFirsColumn ? ' arc_fc' : ''
              }${cell.isLastColumn ? ' arc_lc' : ''}${cell.isSelected && !isRangeSelectorView ? ' arc_selected' : ''}${
                cell.isDisabled ? ' arc_disabled' : ''
              }${cell.isInRange ? ' arc_in_range' : ''}${cell.isRangeStart ? ' arc_range_start' : ''}${
                cell.isRangeEnd ? ' arc_range_end' : ''
              }${isRangeSelectModeOn ? ' arc_range_mode' : ''}`}>
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
  );
}

export const DayOfMonthSelector = memo(DayOfMonthSelectorComponent);
