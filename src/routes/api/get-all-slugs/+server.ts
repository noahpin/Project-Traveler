import { json } from "@sveltejs/kit";

export async function GET({locals: {supabase}}) {
    const { data: slugs, error } = await supabase.from('posts').select('slug');
    if(error) {
        return json({error: error.message}, {status: 500});
    }
    return json(slugs.map(post => post.slug));
}