import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
    // Parse the request body
    const body = await req.json();
    const slug = body.record?.slug; // Assuming your posts have a "slug" field
    const bypassToken = Deno.env.get("BYPASS_TOKEN"); // Read token from environment

    if (!slug) {
        return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
    }

    // Call your SvelteKit API to revalidate the page
    const res = await fetch(`https://your-site.com/api/revalidate?token=${bypassToken}&slug=${slug}`);

    if (!res.ok) {
        return new Response(JSON.stringify({ error: "Failed to revalidate" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, slug }), { status: 200 });
});
