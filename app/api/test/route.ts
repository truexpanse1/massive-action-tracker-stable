// app/api/test/route.ts
export async function GET() {
  return new Response('API IS ALIVE!', { status: 200 });
}
