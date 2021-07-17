# Awesome React Calendar

This project is currentlly under active development. Use `yarn start` to test it.

[Online Demo](https://tusharf5.github.io/react-calendar/)

## Links

https://uxplanet.org/how-to-design-a-perfect-date-picker-control-7f47d1290c3a
https://www.smashingmagazine.com/2017/07/designing-perfect-date-time-picker/
http://ui-patterns.com/patterns/CalendarPicker
https://uxdesign.cc/date-picker-design-5c5ef8f35286
https://material.angular.io/components/datepicker/overview

https://lokeshdhakar.com/dev-201-stripe.coms-main-navigation/
https://codepen.io/smpnjn/pen/VwKXdmy
https://codepen.io/ashfaqace/pen/RpyYdG

## Todos

- highlights
- max
- min
- custom class names
- shortcuts
- add simple validations

## Images

### Date Range view

![Month Dates View](./images/range.png)

### Days of month view

![Month Dates View](./images/view-1.png)

### Years view

![Years View](./images/view-2.png)

### Months view

![Months View](./images/view-3.png)

```
// min width and height should be 276px
  // header(flex) is 14.65 of parent, width of 100%
    // each button is height 28px and first and last button have width 28px and middle one exapands
  // main is 100% - 14.6%
    // weekdays(flex) are 33px in height, botto margin of 9px,
      // each weekday(flex) is flex-basis: 14.285%, max-width: 14.285%, height: 32px;
    // day-of-month is 100% - (33px + 9px)
      // each row is 16.6% i height
        // each cell is 14.285% in width
          // each cell value is width: 65.95%, height: 80.5%;
            // button is 100% width and height
```
