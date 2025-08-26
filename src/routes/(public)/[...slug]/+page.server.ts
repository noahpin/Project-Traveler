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
	let query = supabase.from('posts').select("id,content,title,excerpt,status,page_settings,publish_date").eq('slug', fullPath);
	if(!session) {
		query = query.or('status.eq.published,and(status.eq.scheduled,publish_date.lte.' + new Date().toISOString() + ')');
	}
	const { data: page, error: err } = await query.single();
	if(!page) {
		error(404, 'Not found');
	}
	//deep search through page.content to find all post blocks
	let containers = [];
	let foundPostBlocks: any[] = [];
	const findPostBlocks = (content: any) => {
		if (Array.isArray(content)) {
			content.forEach((item) => findPostBlocks(item));
		} else if (typeof content === 'object' && content !== null) {
			if (content.type === 'post') {
				foundPostBlocks.push(content);
			} else if (content.data.children) {
				findPostBlocks(content.data.children);
			}
		}
	}
	findPostBlocks(page.content.content);
	let postBlockQueryResults: {id: string, posts: any[]}[] = foundPostBlocks.map((block) => {return {id: block.id, posts: []}});
	console.log('Found Post Blocks:', foundPostBlocks);
	for (let i = 0; i < foundPostBlocks.length; i++) {
		let blockQueryData = foundPostBlocks[i].data; 
		let supabaseQuery = supabase.from('posts')
			.select("*,post_tags(tag:tags(*)),post_categories(category:categories(*))")
			.eq("post_type", "post")
			.eq("status", "published")
			.range(blockQueryData.offset, blockQueryData.offset + blockQueryData.limit - 1);
		let { data: posts, error: postError } = await supabaseQuery;
		if (postError) {
			console.error('Error fetching posts for block:', postError);
			continue; // Skip this block if there's an error
		}
		console.log('Fetched posts for block:', blockQueryData.id, posts);
		if (posts) {
			// Filter out posts that are not published or scheduled for future
			posts = posts.filter(post => post.status === 'published' || (post.status === 'scheduled' && moment(post.publish_date).isSameOrBefore(moment())));
			postBlockQueryResults[i].posts = posts;
		} else {
			console.warn('No posts found for block:', blockQueryData.id);
		}
		
	}
	console.log('Post Block Query Results:', postBlockQueryResults);

	return { page, postBlockData: postBlockQueryResults, error: err }
};