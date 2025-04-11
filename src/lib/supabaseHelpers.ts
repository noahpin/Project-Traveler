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
    const regex = /^[a-zA-Z0-9_/-]*$/;
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

/**
 * Uploads a file to Supabase storage and adds it to the files_metadata table
 * @param supabase - The Supabase client instance.
 * @param file - The file to upload.
 * @param bucket - The name of the storage bucket.
 * @param path - The path to upload the file to. IMPORTANT! this should NOT include the file name
 * @param fileName - The name to save the file as.
 * @returns The response from the Supabase storage upload.
 */
export async function uploadFile(supabase: SupabaseClient, file: File, bucket: string, path: string) {
    let fileURLID = crypto.randomUUID();
    let fileExtension = file.name.split(".").pop();
    let fileMetadataName = file.name.split(".").slice(0, -1).join(".");
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path + fileURLID + "." + fileExtension, file);
    if(uploadData == null) return;
    //now, we insert into the files_metadata table the actual file name
    const {data: metadataData, error: metadataError} = await supabase.from("files_metadata").insert({name: fileMetadataName, file_path: path + fileURLID + "." + fileExtension, bucket: bucket, file_id: uploadData.id, id: fileURLID});
}

