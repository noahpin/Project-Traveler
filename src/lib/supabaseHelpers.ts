import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAllSlugs(supabase: SupabaseClient) {
    const { data: slugs, error } = await supabase.from('posts').select('slug,updated_at');
    return {slugs, error}
}