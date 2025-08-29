<script lang="ts">
	import {
		Block,
		Lithograph,
		type BlockSaveData,
	} from "$lib/layout/lithograph";
	import { onMount } from "svelte";
	import { TextBlock } from "$lib/layout/blocks/textBlock";
	import { DividerBlock } from "$lib/layout/blocks/dividerBlock";
	import {
		ImageBlock,
		type ImageBlockSaveData,
	} from "$lib/layout/blocks/imageBlock";
	import { ContainerBlock } from "$lib/layout/blocks/containerBlock";
	import { PostBlock } from "$lib/layout/blocks/postBlock";
	import MediaLibrary from "./MediaLibrary.svelte";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { fade } from "svelte/transition";

	let {
		lithographData,
		supabase,
		hide,
	}: { lithographData?: any | null; hide?: boolean; supabase: SupabaseClient } =
		$props();

	let holder: HTMLElement;
	let editor: Lithograph;
	onMount(() => {
		editor = new Lithograph({
			data: lithographData,
			container: holder,
			blockTypes: [
				TextBlock,
				DividerBlock,
				AncileImageBlock,
				ContainerBlock,
				PostBlock,
			],
			enablePreview: false,
		});
		editor.enableFlex();
	});

	export function getJSON() {
		return editor.getJSON();
	}

	export class AncileImageBlock extends Block {
		image: string = "https://placedog.net/400x200?r";
		previewElement!: HTMLImageElement;
		constructor(editor: Lithograph, parent: Block | null) {
			super(editor, parent);
			this.title = "Image";
			this.icon = `<i class="ti ti-photo"></i>`;
		}

		static get blockType() {
			return "media";
		}
		static get blockName() {
			return "image";
		}

		setData(data: any) {
			this.image = data.url;
			this.previewElement.src = this.image;
		}

		createBlock() {
			super.createBlock();
			let d = document.createElement("div");
			d.classList.add("led-image-block-preview");
			this.previewElement = document.createElement("img");
			this.previewElement.src = this.image;
			d.appendChild(this.previewElement);
			this.contentContainer.appendChild(d);
		}

		renderTopbarButtons() {
			let button = document.createElement("button");
			button.innerHTML = `<i class="ti ti-pencil"></i>`;
			button.classList.add("led-top-bar-button");
			button.onclick = () => openMediaLibrary(this);
			return [button];
		}

		render() {
			return `<div class="lpv-image"><img src="${this.image}" /></div>`;
		}

		save(): BlockSaveData<ImageBlockSaveData> {
			return {
				type: "image",
				id: this.id,
				data: {
					url: this.image,
				},
			};
		}
		onImageSelectedFromMediaLibrary(url: string, metadata_id: string) {
			this.image = url;
			this.previewElement.src = this.image;
		}
	}
	let mediaLibraryOpen = $state(false);
	let mediaSelectCallback = $state<Function | null>(null);
	function openMediaLibrary(blockInstance: AncileImageBlock) {
		mediaLibraryOpen = true;
		mediaSelectCallback = (url: string, metadata_id: string) => {
			blockInstance.onImageSelectedFromMediaLibrary(url, metadata_id);
			mediaLibraryOpen = false;
		};
	}
	let selectedItem: any = $state(null);

	function onMediaConfirm() {
		mediaLibraryOpen = false;
		if (mediaSelectCallback && selectedItem) {
			mediaSelectCallback(selectedItem.url, selectedItem.meta_id);
		}
	}
</script>

<div class="container" class:lithograph-hidden={hide} bind:this={holder}></div>

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
