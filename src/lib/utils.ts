import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import dayjs, { Dayjs } from 'dayjs';

export type CalendarDay = {
  dateString: string;
  weekday: number;
  dayOfMonth: number;
  isFuture: boolean;
  isToday: boolean;
  count?: number;
} | null;
// data is a dictionary with timestamp as the key and the number of records as the count
export function generateCalendarMonth(year: number, month: number, data: { [key: number]: number }): CalendarDay[] {
  let calendar: CalendarDay[] = [];
  let date = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`);
  console.log(date);
  // 补全月份开始的空白日期
  for (let i = 1; i < date.day(); i++) {
    calendar.push(null);
  }
  console.log(data);


  // 填充本月的日期
  while (date.month() === month - 1) {
    const today = dayjs();
    const isFuture = date.isAfter(today, 'day');
    const isToday = date.isSame(today, 'day');
    const count = data[date.valueOf()] || undefined;
    calendar.push({
      dateString: date.format('YYYY-MM-DD'),
      weekday: date.day(),
      dayOfMonth: date.date(),
      isFuture,
      isToday,
      count,
    });
    date = date.add(1, 'day');
  }

  // 补全月份结束的空白日期
  while (calendar.length % 7 !== 0) {
    calendar.push(null);
  }

  return calendar;
}
export type Records = {
  [key: string]: {
    date: number;
  }[];
};


export function getWeeklyDuration(records: Records): [number, number, number, { [key: number]: number }] {
  // Helper function to get the date of the Monday of the current week
  function getMonday(d: Date): Date {
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Helper function to check if a date is in the current week
  function isInCurrentWeek(date: Date): boolean {
    const today = new Date();
    const monday = getMonday(new Date(today));
    const sunday = new Date(monday.getTime());
    sunday.setDate(monday.getDate() + 6);

    return date >= monday && date <= sunday;
  }

  // Helper function to parse a record key and return a Date object
  function parseDateFromKey(key: string): Date {
    const [month, day] = key.split('-').map(Number);
    const year = new Date().getFullYear(); // Assuming it's the current year
    return new Date(year, month - 1, day);
  }
  let records_: { [key: number]: number } = {};
  let today = new Date();
  // Calculate the duration of each day in the current week
  let weeklyDuration = 0;
  let monthlyDuration = 0;
  let dailyDuration = 0;
  for (const [key, timestamps] of Object.entries(records)) {
    const timestamps_ = timestamps.map(t => t.date);
    const date = parseDateFromKey(key);
    const month = date.getMonth();
    if (month == today.getMonth()) {
      monthlyDuration += Math.max(...timestamps_) - Math.min(...timestamps_);
    }
    if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth()) {
      dailyDuration += Math.max(...timestamps_) - Math.min(...timestamps_);
    }

    if (isInCurrentWeek(date)) {
      const dailyDuration = Math.max(...timestamps_) - Math.min(...timestamps_);
      weeklyDuration += dailyDuration;
      records_[date.valueOf()] = dailyDuration + (records_[date.valueOf()] || 0);
    }
  }

  return [weeklyDuration, monthlyDuration, dailyDuration, records_];
}

