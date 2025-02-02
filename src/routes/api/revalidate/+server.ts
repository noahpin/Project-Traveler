import { json } from '@sveltejs/kit';

const VERCEL_REVALIDATE_URL = 'https://api.vercel.com/v1/integrations/deploy/prj_xxx/revalidate';
const VERCEL_TOKEN = 'your-vercel-token'; // Store securely

export async function POST({ request }) {
  const { slug } = await request.json();

  const res = await fetch(`${VERCEL_REVALIDATE_URL}?path=/${slug}&token=${VERCEL_TOKEN}`, {
    method: 'POST'
  });

  return json({ success: res.ok });
}
