import React, { memo } from 'react';

import { MonthIndices } from '../../types';

import { NATIVE_INDEX_TO_LABEL_MONTHS_MAP } from '../../utils/constants';

interface Props {
  onClickPrev: (e: any) => any;
  onClickNext: (e: any) => any;
  onChangeViewType: (view: 'month_dates' | 'months' | 'years') => any;
  viewType: 'month_dates' | 'months' | 'years';
  viewingMonth: MonthIndices;
  viewingYear: number;
  yearMatrixStart: number;
  yearMatrixEnd: number;
}

function HeaderComponent({
  onClickPrev,
  onChangeViewType,
  onClickNext,
  viewType,
  viewingMonth,
  viewingYear,
  yearMatrixEnd,
  yearMatrixStart,
}: Props) {
  return (
    <header className='arc_header'>
      <button className='arc_header_nav arc_header_nav-prev' onClick={onClickPrev}>
        ←
      </button>
      {viewType === 'month_dates' ? (
        <button className='arc_header_label arc_header_label-days-of-month' onClick={() => onChangeViewType('years')}>
          <div>
            <span>{NATIVE_INDEX_TO_LABEL_MONTHS_MAP[viewingMonth]}</span>
          </div>
          <div>
            <span>{viewingYear}</span>
          </div>
        </button>
      ) : viewType === 'months' ? (
        <button className='arc_header_label arc_header_label-months'>
          <div onClick={() => onChangeViewType('years')}>
            <span>{viewingYear}</span>
          </div>
        </button>
      ) : (
        <button className='arc_header_label arc_header_label-years' onClick={() => onChangeViewType('month_dates')}>
          <div>
            <span>
              {yearMatrixStart}-{yearMatrixEnd}
            </span>
          </div>
        </button>
      )}
      <button className='arc_header_nav arc_header_nav-next' onClick={onClickNext}>
        →
      </button>
    </header>
  );
}

export const Header = memo(HeaderComponent);
