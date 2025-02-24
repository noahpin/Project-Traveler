// export const prerender = 'auto'; // Prerenders at build time, but allows new posts via SSR
export const ssr = true;
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import moment from 'moment';

export const config = {
	isr: {
	  expiration: 60,
	  bypassToken: process.env.BYPASS_TOKEN,
	},
  };

export const entries: EntryGenerator = async () => {
	const res = await fetch('https://project-traveler.vercel.app/api/get-all-slugs');
	const slugs = await res.json();
  
	return slugs.map((slug: string) => ({ slug }));
};

export const load: PageServerLoad = async ({ locals: { supabase, session }, params }) => {
	let fullPath = params.slug;
	console.log(fullPath)
	let query = supabase.from('posts').select("id,content,title,excerpt,status,page_settings,publish_date").eq('slug', fullPath);
	if(!session) {
		query = query.or('status.eq.published,and(status.eq.scheduled,publish_date.lte.' + new Date().toISOString() + ')');
	}
	const { data: page, error: err } = await query.single();
	console.log(page, err)
	if(!page) {
		error(404, 'Not found');
	}
	return { page, error: err }
};