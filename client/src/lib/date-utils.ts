import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';

export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function getWeekDays(date: Date) {
  const { start, end } = getWeekRange(date);
  return eachDayOfInterval({ start, end });
}

export function getMonthRange(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return { start, end };
}

export function getMonthWeeks(date: Date) {
  const { start, end } = getMonthRange(date);
  return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
}

export function formatDateRange(start: Date, end: Date) {
  return `${format(start, 'd', { locale: ru })} - ${format(end, 'd MMMM yyyy', { locale: ru })}`;
}

export function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function formatDateDisplay(date: Date) {
  return format(date, 'd', { locale: ru });
}

export function formatMonthYear(date: Date) {
  return format(date, 'MMMM yyyy', { locale: ru });
}

export function nextWeek(date: Date) {
  return addWeeks(date, 1);
}

export function previousWeek(date: Date) {
  return subWeeks(date, 1);
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function getDayNames() {
  return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
}
