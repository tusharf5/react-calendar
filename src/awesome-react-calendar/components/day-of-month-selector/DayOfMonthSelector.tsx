import React, { memo, useCallback, useMemo, useState } from 'react';
import { CSSProps } from '../../calendar';

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
  weekStartIndex: WeekdayIndices;
  fixedRangeLength: number;
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
  isRangeSelectModeOn: boolean;
  setIsRangeSelectModeOn: (on: boolean) => void;
  disableFuture: boolean;
  disablePast: boolean;
  disableToday: boolean;
  maxAllowedDate?: Date;
  minAllowedDate?: Date;
  separator?: string;
  highlights: Date[];
  isDisabled?: (params: IsDisabledParams) => boolean;
  format?: string;
  today: Date;
  onChange?: (value: Value | MultiValue | RangeValue) => any | Promise<any>;
  layoutCalcs: CSSProps;
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
  setIsRangeSelectModeOn,
  fixedRangeLength,
  isFixedRangeView,
  isRangeSelectModeOn,
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
  layoutCalcs,
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
      const clickedDate = cell.date;

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
        const stringkey = toString(clickedDate);
        const newselectedMultiDates = { ...selectedMultiDates };

        if (!!selectedMultiDates[stringkey]) {
          newselectedMultiDates[stringkey] = undefined;
        } else {
          newselectedMultiDates[stringkey] = clickedDate;
        }

        onChangenSelectedMultiDates(newselectedMultiDates);

        onChange &&
          onChange(
            Object.keys(newselectedMultiDates)
              .filter((dk) => !!newselectedMultiDates[dk])
              .map((dk) => ({
                value: newselectedMultiDates[dk] as Date,
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
      setIsRangeSelectModeOn,
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
    <div style={layoutCalcs.dayOfMonth['arc_view-days-of-month']} className='arc_view-days-of-month' role='grid'>
      {daysOfMMonthViewMatrix.map((row, index) => (
        <div style={layoutCalcs.dayOfMonth.arc_view_row} className='arc_view_row' key={index}>
          {row.map((cell) => (
            <div
              style={layoutCalcs.dayOfMonth.arc_view_cell}
              onMouseEnter={() => {
                if (isRangeSelectorView) {
                  if (isRangeSelectModeOn) {
                    onChangenNewSelectedRangeEnd(new Date(cell.year, cell.month, cell.dayOfMonth));
                  }
                }
              }}
              key={cell.dayOfMonth}
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
              <div style={layoutCalcs.dayOfMonth.arc_view_cell_value} className='arc_view_cell_value'>
                <button
                  style={layoutCalcs.dayOfMonth.arc_view_cell_value_button}
                  disabled={cell.isDisabled}
                  tabIndex={cell.isDisabled ? -1 : 0}
                  onClick={() => onDateClicked(cell)}>
                  {cell.dayOfMonth}
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
