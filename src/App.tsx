import { useEffect, useState } from "react";
import {
  generateCalendarMonth,
  getWeeklyDuration,
  CalendarDay,
} from "@/lib/utils";
import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "./components/ui/progress";
function App() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState({});
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [hoursofMonth, setHoursofMonth] = useState(0);
  const [hoursofWeek, setHoursofWeek] = useState(0);
  const [hoursofToday, setHoursofToday] = useState(0);
  const [today, setToday] = useState(new Date());
  useEffect(() => {
    // get userId from search params
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get("userId");
    if (userId) {
      setUserId(userId);
    }
  });
  useEffect(() => {
    fetch("/get?userId=" + userId).then((response) => {
      response.json().then((data) => {
        setData(data["record"]);
        const [timestampofWeek, timestampofMonth, timestampofToday, records] =
          getWeeklyDuration(data["record"]);
        const today = new Date();
        setHoursofMonth(Math.floor(timestampofMonth / 3600 / 1000));
        setHoursofWeek(Math.floor(timestampofWeek / 3600 / 1000));
        setHoursofToday(Math.floor(timestampofToday / 60 / 1000));
        setCalendar(
          generateCalendarMonth(
            today.getFullYear(),
            today.getMonth() + 1,
            records
          )
        );
      });
    });
  });

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 my-4">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 flex-1">
          <div className="grid gap-4  sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="col-span-2">
              <div className="flex justify-between items-center h-full p-2">
                <div className="flex flex-col basis-3/5">
                  <CardTitle>打卡总时长</CardTitle>
                  <CardTitle className="text-4xl">
                    {hoursofMonth} <span className="text-sm">Hrs</span>
                  </CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    打卡总时长要求为 <strong>280Hrs</strong>，已打卡{" "}
                    <strong>{hoursofMonth}Hrs</strong>
                  </CardDescription>
                </div>
                <div className="flex flex-col basis-2/5 py-2">
                  <div
                    className="radial-progress "
                    role="progressbar"
                    style={
                      {
                        "--value": `${hoursofMonth / 2.8}`,
                      } as React.CSSProperties
                    }
                  >
                    <strong className="text-xl">
                      {(hoursofMonth / 2.8).toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>本周打卡</CardDescription>
                <CardTitle className="text-4xl">{hoursofWeek} Hrs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  周均标准 <strong>40Hrs</strong>
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={hoursofWeek / 0.4} />
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>今日打卡</CardDescription>
                <CardTitle className="text-4xl">
                  {Math.floor(hoursofToday / 60)}
                  <span className="text-sm">Hrs</span>
                </CardTitle>
                <CardTitle className="text-4xl">
                  {hoursofToday % 60} <span className="text-sm">Min</span>
                </CardTitle>
              </CardHeader>

              <CardFooter>
                <Progress value={hoursofToday / (0.08 * 60)} />
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Card className="max-w-lg m-4">
        <CardHeader style={{ marginBottom: "-1.5rem" }}>
          <CardTitle>
            {today.getFullYear()}年{today.getMonth() + 1}月
          </CardTitle>
          {/* From Mon to Sun. h-8 w-16*/}
          <div className="grid grid-cols-7">
            <div className="flex items-center justify-center h-8 ">Mon</div>
            <div className="flex items-center justify-center h-8  ">Tue</div>
            <div className="flex items-center justify-center h-8 ">Wed</div>
            <div className="flex items-center justify-center h-8  ">Thu</div>
            <div className="flex items-center justify-center h-8  ">Fri</div>
            <div className="flex items-center justify-center h-8  ">Sat</div>
            <div className="flex items-center justify-center h-8 ">Sun</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="calendar">
            <div className="calendar-body">
              <div className="grid grid-cols-7">
                {calendar.map((day, index) => (
                  <div
                    key={index}
                    className={
                      // aspect ratio 1.5:1 rounded-full
                      "flex items-center justify-center  flex-1 h-10 flex-col" +
                      (day?.isToday
                        ? // black-bg white-foreground rounded-full
                          " bg-black text-white rounded-lg"
                        : "") +
                      (day?.isFuture ? " text-muted-foreground" : "")
                    }
                  >
                    {day?.dayOfMonth}
                    {day?.isFuture == false && day?.count != undefined && (
                      <div
                        className={
                          "w-1 h-1 rounded-full " +
                          (day.count > 8 ? "bg-sky-400" : "bg-red-400")
                        }
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
// console.log();

export default App;
