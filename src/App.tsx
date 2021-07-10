import React, { useCallback, useState } from 'react';

import Calendar from './awesome-react-calendar/calendar';

function App() {
  const [val, setVal] = useState('{}');
  const onChange = useCallback(
    (value) => {
      setVal(JSON.stringify(value, null, 4));
    },
    [setVal]
  );
  const maxDate = new Date(2021, 7, 25);
  const minDate = new Date(2021, 7, 10);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
      <section>
        <div>
          <p>Select Multiple Dates View</p>
        </div>
        <Calendar
          dates={[new Date(2021, 6, 21), new Date(2021, 6, 25), new Date(2021, 6, 9)]}
          selectMultiDates
          disableToday
          separator='/'
          format='MM-DD-YYYY'
          onChange={onChange}
        />
        <div>
          <p>Select Range Select View With Min Max Constraint</p>
        </div>
        <Calendar
          initialViewDate={new Date(2021, 7, 10)}
          selectRange
          maxAllowedDate={maxDate}
          minAllowedDate={minDate}
          disableToday
          separator='/'
          format='MM-DD-YYYY'
          onChange={onChange}
          // startOfWeek={2}
        />
        <div>
          <p>Select Range Select View</p>
        </div>
        <Calendar
          selectRange
          startdate={new Date(2021, 0, 8)}
          endDate={new Date(2021, 0, 22)}
          separator='/'
          format='MM-DD-YYYY'
          onChange={onChange}
          // startOfWeek={2}
          date={new Date(2021, 1, 23)}
        />
        <div>
          <p>Set Start Of The Week</p>
        </div>
        <Calendar startOfWeek={3} onChange={onChange} />
        <div>
          <p>Set Weekend</p>
        </div>
        <Calendar weekends={[4, 5, 6]} onChange={onChange} />
        <div>
          <p>Set If Past Is Disabled</p>
        </div>
        <Calendar disablePast onChange={onChange} />
        <div>
          <p>Set If Today Is Disabled</p>
        </div>
        <Calendar
          disableToday
          date={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)}
          onChange={onChange}
        />
        <div>
          <p>Set If Future Is Disabled</p>
        </div>
        <Calendar disableFuture onChange={onChange} />
        <div>
          <p>Default</p>
        </div>
        <Calendar onChange={onChange} />
      </section>
      <div>{val}</div>
    </div>
  );
}

export default App;
