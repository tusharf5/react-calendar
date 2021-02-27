import React from 'react';

import Calendar from './awesome-react-calendar/calendar';

import { IsDisabledParams } from './awesome-react-calendar/types';

function isDisabled(params: IsDisabledParams) {
  return (
    params.date === 5 ||
    params.date === 10 ||
    params.date === 22 ||
    params.date === 16 ||
    params.weekday === 3 ||
    params.weekday === 0 ||
    params.year === 2001 ||
    params.month === 4
  );
}

function App() {
  return (
    <section>
      <Calendar isDisabled={isDisabled} startOfWeek={0} value={new Date(2021, 1, 23).toISOString()} />
      <Calendar isDisabled={isDisabled} startOfWeek={1} value={new Date(1995, 1, 23).toISOString()} />
      <Calendar isDisabled={isDisabled} startOfWeek={5} value={new Date(2022, 1, 23).toISOString()} />
    </section>
  );
}

export default App;
