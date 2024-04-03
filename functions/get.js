export async function onRequest(context) {
  //get search params
  const params = context.request.queryParams;
  // get by userId
  const task = await context.env.DAKA.get(params.userId);
  if (task) {
    return new Response(task);
  }
  return new Response("{}", { status: 200 });
}
