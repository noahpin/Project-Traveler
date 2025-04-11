<script lang="ts">
	import { uploadFile } from "$lib/supabaseHelpers";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { onMount, type Snippet } from "svelte";
	import { copy } from "svelte-copy";
	import RefreshButton from "$lib/components/RefreshButton.svelte";

	let { supabase, selectedItem = $bindable(null), actionBarContent  }: { supabase: SupabaseClient, selectedItem?: any, actionBarContent?: Snippet } = $props();

	let media: any[] = $state([]);
	let page = 0;

	let selectedItemName = $state("");

	let selectedItemModified = $derived.by(() => {
		if (selectedItem == null) {
			return false;
		}
		return selectedItem.name != selectedItemName;
	});

	async function loadMedia() {
		loading = true;
		let query = supabase
			.from("files_metadata")
			.select("*")
			.order("created_at", { ascending: false })
			.range(page * 50, ((page + 1) * 50) - 1);
		if (searchQuery != "") {
			query.ilike("name", `%${searchQuery}%`);
		}
		const { data, error } = await query;
		loading = false;
		if (data == null) {
			return;
		}

		for (let i = 0; i < data.length; i++) {
			let d = data[i];
			let url = supabase.storage.from("media").getPublicUrl(d.file_path);
			media.push({
				file_id: d.file_id,
				meta_id: d.id,
				name: d.name,
				file_path: d.file_path,
				url: url.data.publicUrl,
				created_at: d.created_at,
			});
		}
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
		loading = true;
		let filePath = selectedItem.file_path;
		const { data, error } = await supabase
			.from("files_metadata")
			.update({
				name: selectedItemName,
			})
			.eq("id", selectedItem.meta_id);
		loading = false;
	}

	async function openFileWindow() {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.multiple = true;
		fileInput.accept = "image/*";
		fileInput.onchange = async (e) => {
			const target = e.target as HTMLInputElement;
			if (!target) return;
			const files = target.files;
			if (files == null) {
				return;
			}
			const uploadPromises = [];
			loading = true;
			for (let i = 0; i < files.length; i++) {
				uploadPromises.push(uploadFile(supabase, files[i], "media", "public/"));
			}
			await Promise.all(uploadPromises);
			refresh();
			loading = false;
		};
		fileInput.click();
	}

	let searchQueryInput = $state("");
	let searchQuery = $state("");
	let loading = $state(false);

	function search() {
		searchQuery = searchQueryInput;
		media = [];
		page = 0;
		loadMedia();
	}

	async function refresh() {
		media = [];
		page = 0;
		await loadMedia();
	}
</script>

<div class="admin-page-content">
	<div class="admin-page-header">
		<div class="admin-buttons">
			<h1>Media Library</h1>
			<RefreshButton {refresh}></RefreshButton>
			<input
				class="admin-editor-input"
				type="text"
				placeholder="Search..."
				bind:value={searchQueryInput}
				onkeydown={(e) => {
					if (e.key == "Enter") {
						search();
					}
				}}
			/>
			<button
				aria-label="search"
				class="button-icon button-primary admin-button"
				onclick={search}
			>
				<i class="ti ti-search"></i>
			</button>

			<button class="admin-button" onclick={openFileWindow}>Upload Files</button
			>
			{#if loading}
				<div class="admin-grid-loader">
					<i class="ti ti-loader-2"></i>
				</div>
			{/if}
		</div>
	</div>

	<div class="admin-editor">
		<div class="admin-editor-fullwidth">
			<div class="admin-media-gallery">
				{#if media.length == 0 }
				<p>No media found</p>
				{/if}
				{#each media as item}
					<div
						role="button"
						tabindex="-1"
						class="admin-media-item"
						class:admin-media-item-selected={selectedItem?.file_id ==
							item.file_id}
						onclick={() => selectItem(item)}
						onkeydown={() => selectItem(item)}
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
			<button class="admin-button" style:margin="auto" onclick={loadMedia}
				>Load More Images</button
			>
		</div>
		{#if selectedItem}
			<div class="admin-editor-column">
				<h2>Image</h2>
				<img src={selectedItem.url} alt={selectedItemName} />
				<div class="admin-editor-metadata-group">
					<div class="admin-editor-metadata-label">URL</div>
					<div class="admin-editor-metadata-id" use:copy={selectedItem.url}>
						{selectedItem.url}
					</div>
				</div>
				<div class="admin-editor-metadata-group">
					<div class="admin-editor-metadata-label">Name</div>
					<input
						class="admin-editor-input"
						type="text"
						bind:value={selectedItemName}
					/>
				</div>

				{#if selectedItemModified}
					<button class="admin-button button-primary" onclick={updateMetadata}
						>Update</button
					>
				{/if}
			</div>
		{/if}
	</div>
	{#if actionBarContent}
	<div class="admin-page-footer">
		{@render actionBarContent()}
	</div>
	{/if}
</div>

<style>
	.admin-editor-fullwidth {
		padding-bottom: 100px;
	}
	.admin-media-gallery {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		grid-auto-rows: 180px;
		gap: 1rem;
		padding: 1rem;
		box-sizing: border-box;
	}
	.admin-media-item {
		border-radius: 6px;
		position: relative;
		cursor: pointer;
		border: 1px solid #00000013;
	}
	img {
		border-radius: 4px;
	}
	.admin-media-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 4px;
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
		border-radius: 4px;
	}
	.admin-editor-input {
		width: 100%;
		max-width: 300px;
	}
</style>
