import React, { memo, useMemo } from 'react';
import { CSSProps } from '../../calendar';

import { WeekdayIndices } from '../../types';

import { getWeekDaysIndexToLabelMapForAStartOfTheWeek } from '../../utils/date-utils';

interface Props {
  weekStartIndex: WeekdayIndices;
  weekendIndices: WeekdayIndices[];
  layoutCalcs: CSSProps;
}

function WeekDaysRowComponent({ weekStartIndex, weekendIndices, layoutCalcs }: Props) {
  // week days as per the start day of the week
  const { order: weekDayOrder, map: weekDayMap } = useMemo(() => {
    return getWeekDaysIndexToLabelMapForAStartOfTheWeek(weekStartIndex);
  }, [weekStartIndex]);

  const weekendIndicesMap: Record<WeekdayIndices, 1> = useMemo(() => {
    return weekendIndices.reduce((acc, curr) => {
      acc[curr] = 1;
      return acc;
    }, {} as Record<WeekdayIndices, 1>);
  }, [weekendIndices]);

  return (
    <ul style={layoutCalcs.weekdaysRow.arc_view_weekdays} className='arc_view_weekdays'>
      {weekDayOrder.map((weekDay, index) => (
        <li
          style={layoutCalcs.weekdaysRow.arc_view_weekdays_cell}
          key={weekDay}
          className={`arc_view_weekdays_cell${weekendIndicesMap[weekDay] ? ' arc_wknd' : ''}`}>
          <span>{weekDayMap[weekDay]}</span>
        </li>
      ))}
    </ul>
  );
}

export const WeekDaysRow = memo(WeekDaysRowComponent);
