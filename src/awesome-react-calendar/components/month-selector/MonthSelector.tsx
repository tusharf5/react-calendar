import React, { memo, useMemo } from 'react';

import { MonthCell, MonthIndices } from '../../types';

import { getMonthViewMetrix } from '../../utils/date-utils';
import { NATIVE_INDEX_TO_LABEL_MONTHS_MAP } from '../../utils/constants';

interface Props {
  onChangeViewType: (view: 'month_dates' | 'months' | 'years') => any;
  onChangeViewingMonth: (month: MonthIndices) => any;
}

function MonthSelectorComponent({ onChangeViewingMonth, onChangeViewType }: Props) {
  const monthsViewMatrix = useMemo<MonthCell[][]>(() => {
    return getMonthViewMetrix({});
  }, []);

  return (
    <div className='arc_view-months'>
      {monthsViewMatrix.map((row, index) => (
        <div className='arc_view_row' key={index}>
          {row.map((cell) => (
            <div className={`arc_view_cell${cell.isCurrentMonth ? ' arc_this_month' : ''}`} key={cell.month}>
              <button
                onClick={() => {
                  onChangeViewingMonth(cell.month);
                  onChangeViewType('month_dates');
                }}>
                {NATIVE_INDEX_TO_LABEL_MONTHS_MAP[cell.month]}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const MonthSelector = memo(MonthSelectorComponent);
