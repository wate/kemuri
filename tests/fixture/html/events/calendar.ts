// @see Documentation: https://fullcalendar.io/docs
// @see Plugin Index: https://fullcalendar.io/docs/plugin-index
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
import iCalendarPlugin from '@fullcalendar/icalendar';
import bootstrapPlugin from '@fullcalendar/bootstrap';

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  if (calendarEl) {
    const calendar = new Calendar(calendarEl, {
      initialDate: new Date(),
      locale: jaLocale,
      editable: true,
      selectable: true,
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
        multiMonthPlugin,
        interactionPlugin,
        iCalendarPlugin,
        bootstrapPlugin,
      ],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next,today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay,multiMonthYear',
      },
      contentHeight: 'auto',
      themeSystem: 'bootstrap',
      nowIndicator: true,
      events: {
        // CORS対策でGoogleカレンダーのURLを直接指定できないため、サーバーサイドで取得して返す必要あり
        url: 'https://calendar.google.com/calendar/ical/ja.japanese%23holiday%40group.v.calendar.google.com/public/basic.ics',
        format: 'ics',
      },
    });
    calendar.render();
  } else {
    console.error('calendar element not found');
  }
});
