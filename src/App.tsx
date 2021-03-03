import React, { useCallback, useState } from 'react';

import Calendar from './awesome-react-calendar/calendar';
import { IsDisabledParams } from './awesome-react-calendar/types';

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
          separator='*'
          format='MM-DD-YYYY'
          onChange={onChange}
          startOfWeek={2}
          value={new Date(2021, 1, 23)}
        />
        <Calendar
          disablePast
          separator='-'
          format='YYYY-DD-MM'
          onChange={onChange}
          startOfWeek={1}
          value={new Date(2021, 2, 23)}
        />
        <Calendar
          disableFuture
          separator='/'
          format='DD-MM-YYYY'
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
