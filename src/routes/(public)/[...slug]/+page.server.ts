export const prerender = 'auto'; // Prerenders at build time, but allows new posts via SSR
export const ssr = true;
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const res = await fetch('https://project-traveler.vercel.app/api/get-all-slugs');
	const slugs = await res.json();
  
	return slugs.map((slug: string) => ({ slug }));
};

export const load: PageServerLoad = async ({ locals: { supabase, session }, params }) => {
	let fullPath = params.slug;
	let query = supabase.from('posts').select("*").eq('slug', fullPath);
	if(!session) {
		query = query.or('status.eq.published,and(status.eq.scheduled,publish_date.lte.' + new Date().toISOString() + ')');
	}
	const { data: page, error: err } = await query.single();
	if(!page) {
		error(404, 'Not found');
	}
	return { page, error: err }
};