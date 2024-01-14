import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear'; // import plugin
import 'dayjs/locale/ja';

dayjs.extend(isLeapYear); // use plugin
dayjs.locale('ja');
