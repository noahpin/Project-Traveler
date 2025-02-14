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

export async function postSlugValidator(slug: string, supabase: SupabaseClient, selfId?: string): Promise<{error: string} | "valid"> {
    const regex = /^[a-z0-9_/-]*$/;
    var regtext =  regex.test(slug);
    if(!regtext) {
        return {error: "Invalid slug. Slugs can only use the characters a-z, 0-9, -, and _."}
    }
    //invalidate "Admin, 12midnight, Tags, and Categories"
    if(slug === "admin" || slug === "12midnight" || slug === "tags" || slug === "categories" || slug === "authors") {
        return {error: "Invalid slug. Slugs cannot be any of the following: admin, 12midnight, tags, categories, authors. Please choose a different slug."}
    }

    let query = supabase.from('posts').select('slug').eq('slug', slug);
    if(selfId) {
        query = query.neq("id", selfId);
    }
    const { data: page, error } = await query;
    if(page && page.length > 0) {
        return {error: "Slug already exists. Please choose a unique slug"}
    }


    return "valid";
}