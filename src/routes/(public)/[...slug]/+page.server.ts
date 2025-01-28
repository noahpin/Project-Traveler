import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	let fullPath = "/" + params.slug;
	const { data: page, error } = await supabase.from('posts').select("*").eq('slug', fullPath).single();
	console.log(fullPath);
	return { page: page ?? [], error }
};