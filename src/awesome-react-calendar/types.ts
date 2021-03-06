export type MonthIndices = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type WeekdayIndices = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DayOfMonthCell {
  date: number;
  month: MonthIndices;
  year: number;
  dayOfWeek: number;
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
  yearInView: number;
  monthInView: MonthIndices;
  startOfTheWeek: WeekdayIndices;
  selectedYear: number;
  selectedMonth: MonthIndices;
  selectedDayOfMonth: number;
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
}
