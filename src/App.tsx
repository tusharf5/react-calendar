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
  const maxDate = new Date(2021, 10, 10);
  const minDate = new Date(2019, 10, 10);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
      <section>
        <Calendar
          selectRange
          maxAllowedDate={maxDate}
          minAllowedDate={minDate}
          startdate={new Date(2021, 0, 8)}
          endDate={new Date(2021, 0, 22)}
          disableToday
          separator='/'
          format='MM-DD-YYYY'
          onChange={onChange}
          weekends={[5, 6]}
          // startOfWeek={2}
          date={new Date(2021, 1, 23)}
        />
        <Calendar disablePast separator='-' format='YYYY-DD-MM' onChange={onChange} startOfWeek={1} date={new Date()} />
        <Calendar
          disableFuture
          separator='/'
          format='DD-MM-YYYY'
          onChange={onChange}
          startOfWeek={1}
          date={new Date(2021, 3, 23)}
        />
      </section>
      <div>{val}</div>
    </div>
  );
}

export default App;
