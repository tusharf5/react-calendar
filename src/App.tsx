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
      <section style={{ textAlign: 'center' }}>
        <div>
          <h2>Multi Date Select</h2>
        </div>
        <Calendar selectMultiDates disableToday separator='/' format='MM-DD-YYYY' onChange={onChange} />
        <div>
          <h2>Range Select With Min Max</h2>
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
          date={new Date(2021, 1, 23)}
        />
        <div>
          <h2>Range Select</h2>
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
          <h2>Start Of The Week Change</h2>
        </div>
        <Calendar startOfWeek={3} onChange={onChange} />
        <div>
          <h2>Weekend Change</h2>
        </div>
        <Calendar weekends={[4, 5, 6]} onChange={onChange} />
        <div>
          <h2>Past Disabled</h2>
        </div>
        <Calendar disablePast onChange={onChange} />
        <div>
          <h2>Today Disabled</h2>
        </div>
        <Calendar
          disableToday
          date={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)}
          onChange={onChange}
        />
        <div>
          <h2>Future Disabled</h2>
        </div>
        <Calendar disableFuture onChange={onChange} />
        <div>
          <h2>Default</h2>
        </div>
        <Calendar onChange={onChange} />
      </section>
      <div>{val}</div>
    </div>
  );
}

export default App;
