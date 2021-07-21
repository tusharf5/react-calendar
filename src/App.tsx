import React, { useCallback, useState } from 'react';
import ReactJson from 'react-json-view';

import Calendar from './awesome-react-calendar/calendar';

import './App.css';
import { Popover } from 'react-tiny-popover';

function App() {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [one, setOne] = useState<object>({});

  const onChangeone = useCallback(
    (value) => {
      setOne(value);
    },
    [setOne]
  );

  const [two, setTwo] = useState<object>({});

  const onChangetwo = useCallback(
    (value) => {
      setTwo(value);
    },
    [setTwo]
  );

  const [three, setThree] = useState<object>({});

  const onChangethree = useCallback(
    (value) => {
      setThree(value);
    },
    [setThree]
  );

  const [four, setFour] = useState<object>({});

  const onChangefour = useCallback(
    (value) => {
      setFour(value);
    },
    [setFour]
  );

  const [five, setFive] = useState<object>({});

  const onChangefive = useCallback(
    (value) => {
      setFive(value);
    },
    [setFive]
  );

  const [six, setSix] = useState<object>({});

  const onChangesix = useCallback(
    (value) => {
      setSix(value);
    },
    [setSix]
  );

  const [seven, setSeven] = useState<object>({});

  const onChangeseven = useCallback(
    (value) => {
      setSeven(value);
    },
    [setSeven]
  );

  const [eight, setEight] = useState<object>({});

  const onChangeeight = useCallback(
    (value) => {
      setEight(value);
    },
    [setEight]
  );

  const [nine, setNine] = useState<object>({});

  const onChangenine = useCallback(
    (value) => {
      setNine(value);
    },
    [setNine]
  );

  const [ten, setTen] = useState<object>({});

  const onChangeTen = useCallback(
    (value) => {
      setTen(value);
    },
    [setTen]
  );

  const [eleven, setEleven] = useState<object>({});

  const onChangeEleven = useCallback(
    (value) => {
      setEleven(value);
    },
    [setEleven]
  );

  const [tweleve, setTweleve] = useState<object>({});

  const onChangeTweleve = useCallback(
    (value) => {
      setTweleve(value);
    },
    [setTweleve]
  );

  const [thirteen, setThirteen] = useState<object>({});

  const onChangeThirteen = useCallback(
    (value) => {
      setThirteen(value);
    },
    [setThirteen]
  );

  const [fourteen, setFourteen] = useState<object>({});

  const onChangeFourteen = useCallback(
    (value) => {
      setFourteen(value);
    },
    [setFourteen]
  );

  const [fiveteen, setFiveteen] = useState<object>({});

  const onChangeFiveteen = useCallback(
    (value) => {
      setFiveteen(value);
    },
    [setFiveteen]
  );

  const maxDate = new Date(2021, 7, 28);
  const minDate = new Date(2021, 7, 4);
  return (
    <div className='demo'>
      <div>
        <div>
          <p>Default</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar isFluid onChange={onChangenine} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={nine} />
          </div>
        </div>
      </div>
      <div>
        <div className='desc'>
          <p>Multiple Dates View</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              value={[new Date(2021, 6, 22), new Date(2021, 6, 25), new Date(2021, 6, 9)]}
              isMultiSelector
              disableToday
              separator='/'
              format='MM-DD-YYYY'
              onChange={onChangeone}
            />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={one} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Range Select View</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              isRangeSelector
              rangeStart={new Date(2021, 0, 8)}
              rangeEnd={new Date(2021, 0, 9)}
              separator='/'
              format='MM-DD-YYYY'
              onChange={onChangethree}
              // startOfWeek={2}
              value={new Date(2021, 1, 23)}
            />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={three} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Range Select View With Min-Max Allowed Dates</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              initialViewDate={new Date(2021, 7, 10)}
              isRangeSelector
              maxAllowedDate={maxDate}
              minAllowedDate={minDate}
              disableToday
              separator='/'
              format='MM-DD-YYYY'
              onChange={onChangetwo}
              // startOfWeek={2}
            />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={two} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Fixed Range View (6 Days)</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar isRangeSelector fixedRange={6} onChange={onChangeThirteen} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={thirteen} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Highlight Custom Dates</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              initialViewDate={new Date(2020, 5, 6)}
              highlights={[new Date(2020, 5, 6), new Date(2020, 5, 12), new Date(2020, 5, 16), new Date(2020, 5, 24)]}
              onChange={onChangeFourteen}
            />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={fourteen} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Disable Custom Dates (here disabled if (date % 4 === 0))</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              isDisabled={(date) => {
                return date.getDate() % 4 === 0;
              }}
              onChange={onChangeFiveteen}
            />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={fiveteen} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Modify Start Day Of The Week (Wed here)</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar startOfWeek={3} onChange={onChangefour} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={four} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Specify Weekends (Fri, Sat, Sun here)</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar weekends={[4, 5, 6]} onChange={onChangefive} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={five} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can disable highliting Weekends</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar weekends={[]} onChange={onChangefive} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={five} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Set If Past Is Disabled</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar disablePast onChange={onChangesix} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={six} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Set If Today Is Disabled</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              disableToday
              value={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)}
              onChange={onChangeseven}
            />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={seven} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Set If Future Is Disabled</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar disableFuture onChange={onChangeeight} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={eight} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Set Output Date Format (YYYY-DD-MM here)</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar format='YYYY-DD-MM' onChange={onChangeTen} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={ten} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Set Output Date Separator (# here)</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar separator='#' onChange={onChangeEleven} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={eleven} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can be rendered inside a popover</p>
        </div>
        <div>
          <div className='input'>
            <input value={(ten as any).formatted as string} />
            <Popover
              isOpen={isPopoverOpen}
              padding={6}
              positions={['bottom', 'top', 'left', 'right']}
              content={
                <Calendar
                  value={(ten as any).date as Date}
                  onChange={(value) => {
                    setTen(value);
                    setIsPopoverOpen(false);
                  }}
                />
              }>
              <div onClick={() => setIsPopoverOpen(!isPopoverOpen)}>🗓</div>
            </Popover>
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can Set Initial Month&Date View To Show (Sept, 2020 here)</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar initialViewDate={new Date(2020, 8, 9)} onChange={onChangeTweleve} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={tweleve} />
          </div>
        </div>
      </div>

      <div>
        <div>
          <p>Easy to theme using CSS variables</p>
        </div>
        <div>
          <div>
            <Calendar className='green' isRangeSelector />
          </div>
          <div>
            <Calendar className='brown' />
          </div>
          <div>
            <Calendar className='violet' isRangeSelector fixedRange={4} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Can adjust size by `size` prop (600px/400px)</p>
        </div>
        <div>
          <div>
            <Calendar fontSize={20} size={600} isRangeSelector />
          </div>
          <div>
            <Calendar fontSize={17} size={400} isMultiSelector />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
