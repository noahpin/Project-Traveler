import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAllSlugs(supabase: SupabaseClient) {
    const { data: slugs, error } = await supabase.from('posts').select('slug,updated_at');
    return {slugs, error}
}

export async function getPage(supabase: SupabaseClient, id: string) {
    let query = supabase.from('posts').select("*").eq('id', id);
    const { data: page, error } = await query.single();
    
    return {page, error}
}