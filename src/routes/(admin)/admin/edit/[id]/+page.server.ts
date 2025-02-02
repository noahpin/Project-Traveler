import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async ({ locals: { supabase, session }, params }) => {
    let query = supabase.from('posts').select("*").eq('id', params.id);
    const { data: page, error: err } = await query.single();
    if(!page) {
        error(404, 'Not found');
    }
    return { page, error: err }
};