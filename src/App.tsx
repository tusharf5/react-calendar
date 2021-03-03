import React, { useCallback, useState } from 'react';

import Calendar from './awesome-react-calendar/calendar';

function App() {
  const [val, setVal] = useState('{}');
  const onChange = useCallback(
    (value) => {
      console.log(value);
      setVal(JSON.stringify(value, null, 4));
    },
    [setVal]
  );
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
      <section>
        <Calendar
          disableToday
          separator='/'
          format='YYYY-DD-MM'
          onChange={onChange}
          startOfWeek={0}
          value={new Date(2021, 1, 23)}
        />
        <Calendar
          disablePast
          separator='/'
          format='YYYY-DD-MM'
          onChange={onChange}
          startOfWeek={1}
          value={new Date(2021, 2, 23)}
        />
        <Calendar
          disableFuture
          separator='/'
          format='YYYY-DD-MM'
          onChange={onChange}
          startOfWeek={1}
          value={new Date(2021, 3, 23)}
        />
      </section>
      <div>{val}</div>
    </div>
  );
}

export default App;
