const getByUserId = async (context, params) => {
  const task = await context.env.DAKA.get(params.get("userId"));
  if (task) {
    return new Response(task);
  }
  return new Response("{}", { status: 200 });
};
const postByUserId = async (context, params) => {
  const body = await context.request.json();
  const { date, userId } = body;
  const dateString = getDateString(new Date(date));
  console.log("dateString", dateString);
  console.log("date", date);
  if (!dateString) {
    return new Response("Invalid Date", { status: 400 });
  }
  const task = await context.env.DAKA.get(userId);
  if (!task) {
    return new Response("User Not Found", { status: 404 });
  }
  let data = JSON.parse(task);
  let record = data["record"] || {};
  if (record[dateString]) {
    record[dateString].push({ time: date, date: date });
  } else {
    record[dateString] = [{ time: date, date: date }];
  }
  data["record"] = record;
  await context.env.DAKA.put(userId, JSON.stringify(data));
  return new Response(JSON.stringify(data), { status: 200 });
};
export async function onRequest(context) {
  //get search params
  const url = new URL(context.request.url);
  const params = url.searchParams;
  console.log(params, params.get("userId"));
  if (!params.get("userId")) {
    return new Response("{}", { status: 200 });
  }
  console.log("Method", context.request.method);
  switch (context.request.method) {
    case "GET":
      return await getByUserId(context, params);
    case "POST":
      return await postByUserId(context, params);
    default:
      return new Response("Method Not Allowed", { status: 405 });
  }

  // get by userId
}

// 7:00-12:20=>1   13:00-18:20=>2 19:00-24:20=>3
var getDateString = (date) => {
  const hour = date.getHours();
  const dateStr = date.getMonth() + 1 + "-" + date.getDate();
  console.log("Date", date, hour);

  if (hour > 6 && hour <= 12) {
    return `${dateStr}-1`;
  } else if (hour >= 13 && hour <= 18) {
    return `${dateStr}-2`;
  } else if (hour < 1) {
    const previousDate = new Date(date.valueOf() - 24 * 60 * 60 * 1e3);
    console.log("previousDate", previousDate);
    return `${previousDate.getMonth() + 1}-${previousDate.getDate()}-3`;
  } else if (hour >= 19 || hour <= 23) {
    return `${dateStr}-3`;
  } else {
    return null;
  }
};
