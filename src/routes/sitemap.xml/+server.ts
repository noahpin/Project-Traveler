import { getAllSlugs } from "$lib/supabaseHelpers";

export async function GET({ locals: { supabase }, setHeaders }) {
	const { slugs, error }: { slugs: any[] | null; error: any } =
		await getAllSlugs(supabase);
	setHeaders({
		"Content-Type": "application/xml",
	});
	if (error || !slugs) {
		return new Response("Error fetching slugs", { status: 500 });
	}
	const site = "https://project-traveler.vercel.app";
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
    <loc>${site}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    </url>
    ${slugs
			.map(
				(slug) => `
    <url>
    <loc>${site}/${slug.slug}</loc>
    <changefreq>weekly</changefreq>
<lastmod>${slug.updated_at.split("T")[0]}</lastmod>
    </url>
    `
			)
			.join("")}
    </urlset>`;
	return new Response(sitemap);
}
