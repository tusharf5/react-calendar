import React, { memo, useMemo } from 'react';

import { YearCell } from '../../types';

import { getYearsViewMetrix } from '../../utils/date-utils';

interface Props {
  onChangeViewType: (view: 'month_dates' | 'months' | 'years') => any;
  onChangeViewingYear: (year: number) => any;
  yearMatrixStart: number;
  yearMatrixEnd: number;
}

function YearSelectorComponent({ onChangeViewType, onChangeViewingYear, yearMatrixStart, yearMatrixEnd }: Props) {
  // TODO add highlight slected dates years
  const yearsMatrix = useMemo<YearCell[][]>(() => {
    return getYearsViewMetrix(yearMatrixStart, {});
  }, [yearMatrixStart]);

  return (
    <div className='arc_view-years'>
      {yearsMatrix.map((row, index) => (
        <div className='arc_view_row' key={index}>
          {row.map((cell) => (
            <div className={`arc_view_cell${cell.isCurrentYear ? ' arc_this_year' : ''}`} key={cell.year}>
              <button
                onClick={() => {
                  onChangeViewingYear(cell.year);
                  onChangeViewType('months');
                }}>
                {cell.year}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const YearSelector = memo(YearSelectorComponent);
