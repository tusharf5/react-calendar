import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

interface IsDisabledParams {
  date: number;
  year: number;
  month: number;
  weekday: number;
}

function isDisabled(params: IsDisabledParams) {
  return params.date === 5 || params.date === 10 || params.date === 22 || params.date === 16;
}

ReactDOM.render(
  <React.StrictMode>
    <App isDisabled={isDisabled} startOfWeek={1} value={new Date(2020, 5, 23).toISOString()} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
