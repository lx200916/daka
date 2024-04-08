import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import dayjs from 'dayjs';
export type Record = { "timestamp": string, "role": Role } | null;
export type CalendarDay = {
  dateString: string;
  weekday: number;
  dayOfMonth: number;
  isFuture: boolean;
  isToday: boolean;
  count?: number;
  records?: Record[];
} | null;
// data is a dictionary with timestamp as the key and the number of records as the count
export function generateCalendarMonth(year: number, month: number, data: { [key: number]: { "total": number, "r": Record[] } }): CalendarDay[] {
  let calendar: CalendarDay[] = [];
  let date = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`);
  console.log(date);
  // 补全月份开始的空白日期
  for (let i = 1; i < date.day(); i++) {
    calendar.push(null);
  }
  // console.log(data);


  // 填充本月的日期
  while (date.month() === month - 1) {
    const today = dayjs();
    const isFuture = date.isAfter(today, 'day');
    const isToday = date.isSame(today, 'day');
    const data_ = data[date.valueOf()] || { total: 0, r: [] };
    const count = Math.floor(data_.total / 3600 / 1000) || 0;
    calendar.push({
      dateString: date.format('YYYY-MM-DD'),
      weekday: date.day(),
      dayOfMonth: date.date(),
      isFuture,
      isToday,
      count,
      records: data_.r,
    });
    date = date.add(1, 'day');
  }

  // 补全月份结束的空白日期
  while (calendar.length % 7 !== 0) {
    calendar.push(null);
  }
  console.log(calendar);

  return calendar;
}
export type Records = {
  [key: string]: {
    date: number;
  }[];
};
export enum Role {
  "Checkin" = "checkin",
  "Checkout" = "checkout",
  "None" = "none",
}

export function getWeeklyDuration(records: Records): [number, number, number, { [key: number]: { "total": number, "r": Record[] } }] {
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
    console.log(monday, sunday, date);

    return date >= monday && date <= sunday;
  }

  // Helper function to parse a record key and return a Date object
  function parseDateFromKey(key: string): Date {
    const [month, day] = key.split('-').map(Number);
    const year = new Date().getFullYear(); // Assuming it's the current year
    return new Date(year, month - 1, day);
  }
  let records_: { [key: number]: { "total": number, "r": Record[] } } = {};
  let today = new Date();
  // Calculate the duration of each day in the current week
  let weeklyDuration = 0;
  let monthlyDuration = 0;
  let dailyDuration = 0;
  for (const [key, timestamps] of Object.entries(records)) {
    const timestamps_ = timestamps.map(t => t.date).sort();
    const r = [];
    for (let i = 0; i < timestamps_.length; i += 1) {
      let role = Role.None;
      // First is checkin, last is checkout
      if (i == 0) {
        role = Role.Checkin;
      } else if (i == timestamps_.length - 1) {
        role = Role.Checkout;
      }
      // to utc +00 timezone time string
      const hours_minutes_seconds_str = new Date(timestamps_[i]).toISOString().slice(11, 19);
      r.push({ "timestamp": hours_minutes_seconds_str, "role": role });
    }
    const date = parseDateFromKey(key);
    const month = date.getMonth();
    const duration = Math.max(...timestamps_) - Math.min(...timestamps_);
    if (month == today.getMonth()) {
      monthlyDuration += duration;
      if (records_[date.valueOf()] == undefined) {
        records_[date.valueOf()] = { "total": 0, "r": [] };
      }
      records_[date.valueOf()]["total"] += duration;
      records_[date.valueOf()]["r"].push(...r);
    }
    if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth()) {
      dailyDuration += duration;
    }

    if (isInCurrentWeek(date)) {
      weeklyDuration += duration;
    }

  }

  return [weeklyDuration, monthlyDuration, dailyDuration, records_];
}

