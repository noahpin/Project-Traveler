<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { onMount } from "svelte";

    let {supabase}: {supabase: SupabaseClient} = $props();

    type MediaElement = {
        id: string;
        name: string;
        url: string;
        type: string;
        created_at: string;
        updated_at: string;
    }

    let media: MediaElement[] = $state([]);

    async function loadMedia() {
        const {data, error} = await supabase
        .storage.from("media").list("public", {
            limit: 50,
            sortBy: {column: "created_at", order: "desc"}
        });
        console.log(data, error)
        if(data == null) {
            return;
        }
        for(let i = 0; i < data.length; i++) {
            if(data[i].metadata.mimetype == "application/octet-stream") {
                continue;
            }
            let d = data[i];
            let url = supabase.storage.from("media").getPublicUrl("public/"+d.name);
            media.push({
                id: d.id,
                name: d.name,
                url: url.data.publicUrl,
                type: d.metadata.type,
                created_at: d.created_at,
                updated_at: d.updated_at
            });
        }   
        console.log($state.snapshot(media))
    }

    onMount(async ()=>{
        await loadMedia();
    })
</script>
<div class="admin-media-gallery">
    {#each media as item}
        <div class="admin-media-item">
            <img src={item.url} alt={item.name}>
        </div>
    {/each}
</div>
<style>
    .admin-media-gallery {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, 180px);
        grid-auto-rows: 180px;
        gap: 1rem;
        padding: 1rem;
        box-sizing: border-box;
    }
    .admin-media-item {
        background: red;
    }
    .admin-media-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>