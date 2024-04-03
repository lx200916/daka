export async function onRequest(context) {
  //get search params
  const url = new URL(context.request.url);
  const params = url.searchParams;
console.log(params, params.get("userId"));

  // get by userId
  const task = await context.env.DAKA.get(params.get("userId"));
  if (task) {
    return new Response(task);
  }
  return new Response("{}", { status: 200 });
}
