export type MonthIndices = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type WeekdayIndices = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DayOfMonthCell {
  date: number;
  month: MonthIndices;
  year: number;
  dayOfWeek: number;
  activeMonthInView: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isWeekend: boolean;
  isToday: boolean;
  isFirstRow: boolean;
  isLastRow: boolean;
  isFirsColumn: boolean;
  isSelected: boolean;
  isLastColumn: boolean;
  isDisabled: boolean;
}

export interface YearCell {
  year: number;
  isCurrentYear: boolean;
  isSelectedYear: boolean;
}

export interface MonthCell {
  month: MonthIndices;
  isCurrentMonth: boolean;
  isSelectedMonth: boolean;
}

export interface IsDisabledParams {
  date: number | -1;
  year: number | -1;
  month: MonthIndices | -1;
  weekday: WeekdayIndices | -1;
}

export interface GetDaysOfMonthViewMetrixParams {
  isSelectMultiDate: boolean;
  selectedMultiDates: Record<string, Date | undefined>;
  isRangeView: boolean;
  isRangeSelectModeOn: boolean;
  yearInView: number;
  monthInView: MonthIndices;
  weekendIndexes: WeekdayIndices[];
  startOfTheWeek: WeekdayIndices;
  selectedYear: number;
  selectedMonth: MonthIndices;
  selectedDayOfMonth: number;
  selectedStartYear: number;
  selectedStartMonth: MonthIndices;
  selectedStartDayOfMonth: number;
  selectedEndYear: number;
  selectedEndMonth: MonthIndices;
  selectedEndDayOfMonth: number;
  newRangeStartYear: undefined | number;
  newRangeStartDate: undefined | number;
  newRangeStartMonth: undefined | MonthIndices;
  newRangeEndYear: undefined | number;
  newRangeEndDate: undefined | number;
  newRangeEndMonth: undefined | MonthIndices;
  maxDate: Date;
  minDate: Date;
  applyMax: boolean;
  applyMin: boolean;
  disableFuture: boolean;
  disablePast: boolean;
  disableToday: boolean;
  isDisabled?: (params: IsDisabledParams) => boolean;
}

export interface CheckIfDateIsDisabledHOFParams {
  disablePast: boolean;
  disableToday: boolean;
  disableFuture: boolean;
  customDisabledCheck?: (params: IsDisabledParams) => boolean;
  maxDate: Date;
  minDate: Date;
  applyMax: boolean;
  applyMin: boolean;
}

export interface DateParts {
  month: number;
  year: number;
  monthDate: number;
}
