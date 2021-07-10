import React, { useCallback, useState } from 'react';
import ReactJson from 'react-json-view';

import Calendar from './awesome-react-calendar/calendar';

import './App.css';

function App() {
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

  const maxDate = new Date(2021, 7, 28);
  const minDate = new Date(2021, 7, 4);
  return (
    <div className='demo'>
      <div>
        <div className='desc'>
          <p>Select Multiple Dates View</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              dates={[new Date(2021, 6, 21), new Date(2021, 6, 25), new Date(2021, 6, 9)]}
              selectMultiDates
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
          <p>Select Range Select View With Min-Max Constraint</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              initialViewDate={new Date(2021, 7, 10)}
              selectRange
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
          <p>Select Range Select View</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar
              selectRange
              startdate={new Date(2021, 0, 8)}
              endDate={new Date(2021, 0, 22)}
              separator='/'
              format='MM-DD-YYYY'
              onChange={onChangethree}
              // startOfWeek={2}
              date={new Date(2021, 1, 23)}
            />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={three} />
          </div>
        </div>
      </div>

      <div>
        <div>
          <p>Can Modify Start Day Of The Week</p>
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
          <p>Can Modify Weekends</p>
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
              date={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)}
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
          <p>Default</p>
        </div>
        <div>
          <div className='calendar'>
            <Calendar onChange={onChangenine} />
          </div>
          <div className='json'>
            <ReactJson name='value' enableClipboard={false} src={nine} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
