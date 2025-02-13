import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async ({ locals: { supabase, session }, params }) => {
    let query = supabase.from('tags').select("*").eq('id', params.id);
    const { data: tag, error: err } = await query.single();
    if(!tag) {
        error(404, 'Not found');
    }
    return { tag, error: err }
};