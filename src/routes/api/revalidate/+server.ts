import { json } from "@sveltejs/kit";

export async function POST({ request }) {
    const { slug, token } = await request.json();
    if (token !== process.env.BYPASS_TOKEN) {
        return json({ error: "Invalid token" }, { status: 403 });
    }
    if (token !== process.env.BYPASS_TOKEN) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!slug) {
        return json({ error: 'Missing slug' }, { status: 400 });
    }

    await fetch(`https://project-traveler.vercel.app/${slug}?__bypass=${process.env.BYPASS_TOKEN}`);

    return json({ success: true, slug });
}
