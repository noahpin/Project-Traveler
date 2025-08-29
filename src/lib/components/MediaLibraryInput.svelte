<script lang="ts">
	import MediaLibrary from "$lib/components/MediaLibrary.svelte";
	import { fade } from "svelte/transition";

	let { image = $bindable(""), supabase, title = "Image" } = $props();
	let mediaLibraryOpen = $state(false);

    let selectedItem: any = $state(null);
	function onMediaConfirm() {
		mediaLibraryOpen = false;
		if (selectedItem) {
			image = selectedItem.url;
		}
	}
</script>

<div class="admin-editor-metadata-group">
	<div class="admin-editor-metadata-label">{title}</div>
	<button
		onclick={() => (mediaLibraryOpen = true)}
		class="admin-editor-metadata-featured-image"
	>
		{#if image && image != ""}
			<img
				src={image}
				alt=""
				class="admin-editor-metadata-featured-image-preview"
			/>
		{/if}
		<div
			class="admin-editor-metadata-featured-image-button"
			class:admin-editor-metadata-featured-image-button-exist={image != "" &&
				image != null}
		>
			Select Image
		</div>
	</button>
</div>

{#snippet mediaLibraryConfirmButton()}
	<button class="admin-button" onclick={onMediaConfirm}>Select</button>
{/snippet}

{#if mediaLibraryOpen}
	<div class="admin-modal" transition:fade={{ duration: 20 }}>
		<div class="admin-modal-content">
			<MediaLibrary
				{supabase}
				bind:selectedItem
				actionBarContent={mediaLibraryConfirmButton}
			></MediaLibrary>
		</div>
	</div>
{/if}
