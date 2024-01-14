import { Calendar } from '@fullcalendar/core';
import jaLocale from '@fullcalendar/core/locales/ja';
//support view: dayGridYear, dayGridMonth, dayGridWeek, dayGridDay, dayGrid
import dayGridPlugin from '@fullcalendar/daygrid';
//support view: timeGridWeek, timeGridDay, timeGrid
import timeGridPlugin from '@fullcalendar/timegrid';
//support view: listYear, listMonth, listWeek, listDay, list
import listPlugin from '@fullcalendar/list';
//support view: multiMonthYear, multiMonth
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  if (calendarEl) {
    const calendar = new Calendar(calendarEl, {
      initialDate: new Date(),
      locale: jaLocale,
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
        multiMonthPlugin,
        interactionPlugin,
        bootstrapPlugin,
      ],
      initialView: 'timeGridDay',
      headerToolbar: {
        left: 'prev,next,today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay,multiMonthYear',
      },
      contentHeight: 'auto',
      themeSystem: 'bootstrap',
      nowIndicator: true,
    });
    calendar.render();
  } else {
    console.log('calendar element not found');
  }
});
