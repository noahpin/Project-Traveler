<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { onMount } from "svelte";

	let { supabase }: { supabase: SupabaseClient } = $props();


	let media: any[] = $state([]);
	let selectedItem: any | null = $state(null);
	let page = 0;

    let selectedItemName = $state("");


    let selectedItemModified = $derived.by(() => {
        if(selectedItem == null) {
            return false;
        }
        return selectedItem.name != selectedItemName;
    });

	async function loadMedia() {
		// const { data, error } = await supabase.storage
		// 	.from("media")
		// 	.list("public", {
		// 		limit: 50,
		// 		offset: page * 50,
		// 		sortBy: { column: "created_at", order: "desc" },
		// 	});
        const {data, error} = await supabase.rpc("fetch_metadata_with_files", {
            p_limit: 50,
            p_offset: page * 50,
            p_sort_by: "created_at",
            p_order: "desc",
        });
		console.log(data, error);
		if (data == null) {
			return;
		}

        
		for (let i = 0; i < data.length; i++) {
			if (data[i].object_metadata.mimetype == "application/octet-stream") {
				continue;
			}
			let d = data[i];
			let url = supabase.storage.from("media").getPublicUrl(d.file_name);
			media.push({
				file_id: d.file_id,
                meta_id: d.metadata.id,
				name: d.metadata.name,
                file_path: d.file_name,
				url: url.data.publicUrl,
				type: d.object_metadata.mimetype,
				created_at: d.created_at,
			});
		}
		console.log($state.snapshot(media));
		page++;
	}

	onMount(async () => {
		await loadMedia();
	});

    function selectItem(item: any) {
        selectedItem = item;
        selectedItemName = item.name;
    }

    async function updateMetadata() {
        let filePath = selectedItem.file_path
        if(selectedItemName != selectedItem.name) {
            //replace file path
            let oldFilePath = filePath;
            filePath = filePath.replace(selectedItem.name, selectedItemName);
            const {data, error} = await supabase.storage.from("media").move(oldFilePath, filePath);
            console.log(data, error);
        }
        console.log(filePath, selectedItemName, selectedItem.meta_id)
        const {data, error} = await supabase.from("files_metadata").update({
            name: selectedItemName,
            file_path: filePath,
        }).eq("id", selectedItem.meta_id);

        console.log(data, error);
    }
</script>

<div class="admin-editor">
	<div class="admin-editor-fullwidth">
		<div class="admin-media-gallery">
			{#each media as item}
				<div
					role="button"
					tabindex="-1"
					class="admin-media-item"
					class:admin-media-item-selected={selectedItem?.file_id == item.file_id}
					onclick={() => (selectItem(item))}
					onkeydown={() => (selectItem(item))}
				>
					<img
						src={item.url}
						alt={item.name}
						onload={(e) =>
							((e.target as HTMLElement).style.opacity = String(1))}
						style="opacity: 0; transition: opacity 0.5s;"
					/>
				</div>
			{/each}
		</div>
		<button onclick={loadMedia}>load more</button>
	</div>
    {#if selectedItem}
	<div class="admin-editor-column">
		<h2>Image</h2>
        <img src={selectedItem.url} alt={selectedItemName} />
		<div class="admin-editor-metadata-group">
			<div class="admin-editor-metadata-label">Name</div>
            <input class="admin-editor-input" type="text" bind:value={selectedItemName} />
		</div>

        {#if selectedItemModified}
            <button class="admin-button button-primary" onclick={updateMetadata}>Update</button>
        {/if}

	</div>
    {/if}
</div>

<style>
	.admin-media-gallery {
		width: 100%;
		display: grid;
        grid-template-columns: repeat(auto-fill, 180px);
		grid-auto-rows: 180px;
        aspect-ratio: 1 / 2;
		gap: 1rem;
		padding: 1rem;
		box-sizing: border-box;
	}
	.admin-media-item {
		border-radius: 6px;
		position: relative;
		cursor: pointer;
	}
    img {
        border-radius: 6px;
    }
	.admin-media-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 6px;
		cursor: pointer;
	}
	.admin-media-item-selected {
		outline: 5px solid var(--accent);
	}
	.admin-media-item-selected::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		outline: 2px solid white;
		border-radius: 6px;
	}
    .admin-editor-input {
        max-width: 100%;
    }
</style>
