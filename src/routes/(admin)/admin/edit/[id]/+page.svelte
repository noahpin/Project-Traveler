<script lang="ts">
	import moment from "moment";
	import MediaLibrary from "$lib/components/MediaLibrary.svelte";
	//@ts-ignore
	import { DateTime } from "luxon";
	import "$lib/layoutEditor.css";
	import Lithograph from "$lib/components/Lithograph.svelte";
	import { goto } from "$app/navigation";
	import { getPage, postSlugValidator } from "$lib/supabaseHelpers";
	import PageRenderer from "$lib/components/PageRenderer.svelte";
	import Color from "@tiptap/extension-color";
	import ColorInput from "$lib/components/ColorInput.svelte";
	import CheckboxInput from "$lib/components/CheckboxInput.svelte";
	import { computePosition } from "@floating-ui/core";
	import { platform, flip, offset, shift } from "@floating-ui/dom";
	import { createPopper } from "@popperjs/core";
	import { Toaster, toast } from "svelte-sonner";
	import { copy } from "svelte-copy";

	import { onDestroy, onMount } from "svelte";
	import AdminTaxonomyInput from "$lib/components/AdminTaxonomyInput.svelte";
	import MonacoEditor from "$lib/components/MonacoEditor.svelte";
	import { fade } from "svelte/transition";
	import MediaLibraryInput from "$lib/components/MediaLibraryInput.svelte";
	let { data } = $props();
	let { page: originalPageData, supabase } = $derived(data);
	// svelte-ignore state_referenced_locally
	// svelte-ignore state_referenced_locally
	let page = $state(originalPageData);
	let pageCategories: {name: string, id: string}[] = $state(page.post_categories.map((category: { category: { name: any; id: any; }; }) => {return {name: category.category.name, id: category.category.id}}));
	let pageTags: {name: string, id: string}[] = $state(page.post_tags.map((tag: { tag: { name: any; id: any; }; }) => {return {name: tag.tag.name, id: tag.tag.id}}));
	page.publish_date = page.publish_date
		? DateTime.fromISO(page.publish_date).toISO().slice(0, 16)
		: null;
	let lithograph;
	let pageSlugWithoutSelfSlug = page.slug.replace(
		new RegExp(page.self_slug + "$"),
		""
	);
	let parentPage: any = $state(null);
	if (page.parent_id) {
		checkForParent();
	}

	async function checkForParent() {
		const { page: pg, error } = await getPage(supabase, page.parent_id);
		parentPage = pg;
	}

	let pageSettings: {
		disable_navbar: boolean;
		css: string;
	} = $state(page.page_settings);

	let disableNavbar = $state(pageSettings?.disable_navbar ?? false);
	let pageCSS = $state(pageSettings?.css ?? "");

	let updatingData = $state(false);
	async function updateData() {
		showPublishPopover = false;
		let valid = await checkForPostPublishValidity();
		if (!valid) {
			toast.error(
				"Could not update page as errors are present. Please fix them and try again"
			);
			return;
		}
		let data = lithograph!.getJSON();
		let pageData = $state.snapshot(page);
		let timeStart = Date.now();
		updatingData = true;
		pageData.content = { content: data };
		pageData.content.flex = originalPageData.content?.flex ?? false;
		pageData.page_settings = {
			disable_navbar: disableNavbar,
			css: pageCSS,
		};
		let diff = Object.keys(pageData).reduce(
			(acc: { [key: string]: any }, key) => {
				if (pageData[key] != originalPageData[key]) {
					acc[key] = pageData[key];
				}
				return acc;
			},
			{}
		);
		delete diff.post_categories;
		delete diff.post_tags;
		let { data: dat, error } = await supabase
			.from("posts")
			.update(diff)
			.eq("id", page.id);

		//now, we need to delete all of the post-category and post-tag relations and then recreate them, with the new relations.
		let {data: dataCategoryDelete, error: errorCategoryDelete} = await supabase
			.from("post_categories")
			.delete()
			.eq("post_id", page.id);
		let {data: dataTagDelete, error: errorTagDelete} = await supabase
			.from("post_tags")
			.delete()
			.eq("post_id", page.id);

		//now reinsert! :(
		let {data: dataCategoryInsert, error: errorCategoryInsert} = await supabase
			.from("post_categories")
			.insert(pageCategories.map((category) => {
				return {
					post_id: page.id,
					category_id: category.id
				}
			}));
		let {data: dataTagInsert, error: errorTagInsert} = await supabase
			.from("post_tags")
			.insert(pageTags.map((tag) => {
				return {
					post_id: page.id,
					tag_id: tag.id
				}
			}));

		if (error) {
			console.error(error);
			toast.error("Error updating page: " + error.message);
		} else {
			toast.success(`${page.post_type.charAt(0).toUpperCase() + page.post_type.slice(1)} updated successfully`);
		}

		let timeEnd = Date.now();

		setTimeout(
			() => {
				updatingData = false;
			},
			Math.max(1000 - (timeEnd - timeStart), 0)
		);
	}
	let previewing = $state(false);
	let pageRendererData: {
		content: any[];
		flex: boolean | null;
	} = $state({ content: [], flex: false });

	let scheduledDatePicker: HTMLInputElement;
	let scheduledDatePickerSecondary: HTMLInputElement;

	let mediaLibraryOpen = $state(false);
	let selectedItem: any = $state(null);
	function onMediaConfirm() {
		mediaLibraryOpen = false;
		if (selectedItem) {
			page.featured_image = selectedItem.url;
		}
	}
	
	//TODO: make this reversible
	function preview() {
		previewing = true;
		pageRendererData = { content: lithograph!.getJSON(), flex: true }; //TODO: make flex be accurate to what is in the lithograph
	}

	async function publishImmediately() {
		showPublishPopover = false;
		let valid = await checkForPostPublishValidity();
		if (!valid) {
			toast.error(
				"Could not update page as errors are present. Please fix them and try again"
			);
			return;
		}
		page.status = "published";
		updateData();
	}

	async function schedulePublish() {
		showPublishPopover = false;
		let valid = await checkForPostPublishValidity();
		if (!valid) {
			toast.error(
				"Could not update page as errors are present. Please fix them and try again"
			);
			return;
		}
		page.status = "scheduled";
		updateData();
	}

	let publishPopover: HTMLElement;
	let publishButton: HTMLElement | null = $state(null);
	let showPublishPopover = $state(false);
	let showScheduleUI = $state(false);
	$effect(() => {
		if (showPublishPopover) {
			showScheduleUI = false;
		}
	});
	onMount(async () => {
		createPopper(publishButton!, publishPopover, {
			placement: "bottom",
			modifiers: [
				{
					name: "offset",
					options: {
						offset: [0, 8],
					},
				},
				{
					name: "preventOverflow",
					options: {
						padding: 8,
					},
				},
			],
		});
	});

	let debounceSlug: NodeJS.Timeout | null = $state(null);
	let slugError = $state(false);
	let slugErrorMessage = $state("");
	let titleError = $state(false);
	let titleErrorMessage = $state("");


	async function checkForPostPublishValidity() {
		if (page.title == "") {
			titleError = true;
			titleErrorMessage = "Title is empty. Please enter a title.";
		}
		await checkSlugValidity();
		if (titleError || slugError) {
			return false;
		}
		return true;
	}

	function deferCheckSlugValidity() {
		slugError = false;
		if (debounceSlug) {
			clearTimeout(debounceSlug);
		}
		debounceSlug = setTimeout(checkSlugValidity, 500);
	}
	async function checkSlugValidity() {
		let result = await postSlugValidator(
			pageSlugWithoutSelfSlug + page.self_slug,
			supabase,
			page.id
		);
		if (result != "valid") {
			slugError = true;
			slugErrorMessage = result.error;
		}
	}
</script>

<svelte:window
	onclick={(e) => {
		if (
			!publishPopover.contains(e.target as Node) &&
			!publishButton?.contains(e.target as Node)
		)
			showPublishPopover = false;
	}}
/>

<div class="admin-page-content">
	<div class="admin-page-header">
		<div class="admin-buttons">
			<button
				onclick={() => goto("/admin/" + page.post_type + "s")}
				class="admin-header-tame-button"
				aria-label="Go back"
			>
				<i class="ti ti-arrow-left"></i>
			</button>
			<h1>Edit {page.post_type}</h1>
		</div>
		<div class="admin-buttons admin-page-header-left">
			{#if updatingData}
				<div class="admin-button-loading-spinner">
					<i class="ti ti-loader-2"></i>
				</div>
			{/if}
			{#if !previewing}
				<button class="admin-button button-sub" onclick={preview}>
					Preview
				</button>
			{:else}
				<button
					class="admin-button button-sub"
					onclick={() => (previewing = false)}
				>
					Edit
				</button>
			{/if}
			<a href={"/" + page.slug} target="_blank" class="admin-button button-sub">
				Go to Live Page<i class="ti ti-external-link"></i>
			</a>
			{#if page.status == "draft" || page.status == "scheduled"}
				<button
					onclick={updateData}
					class="admin-button button-secondary"
					disabled={updatingData}
					>Save Draft
				</button>
				<button
					onclick={() => {
						showPublishPopover = !showPublishPopover;
					}}
					class="admin-button button-primary"
					disabled={updatingData}
					bind:this={publishButton}
				>
					Publish <i class="ti ti-chevron-down"></i>
				</button>
			{:else}
				<button
					onclick={updateData}
					disabled={updatingData}
					class="admin-button button-primary"
				>
					Update
				</button>
			{/if}
		</div>
	</div>
	<div class="admin-editor">
		<Toaster position="top-right" offset="10px" richColors></Toaster>
		
		<div
			class="admin-editor-css-sidebar admin-editor-sidebar"
			class:admin-editor-sidebar-collapsed={!previewing}
		>
			<div class="admin-editor-css-sidebar-inner admin-editor-sidebar-inner">
				<div class="admin-editor-sidebar-section" style:height="100%">
					<h2>Edit CSS</h2>
					<MonacoEditor
						bind:value={pageCSS}
						language="css"
						></MonacoEditor>
				</div>
			</div>
		</div>
		<div class="admin-editor-page-editor">
			<Lithograph
				bind:this={lithograph}
				hide={previewing}
				lithographData={page.content}
				{supabase}
			/>
			{#if previewing}
			{@html "<style>" + pageCSS + "</style>"}
				<PageRenderer
					content={pageRendererData}
					injectCSS={false}
					settings={pageSettings}
				></PageRenderer>
			{/if}
		</div>

		<div
			class="admin-editor-metadata-sidebar admin-editor-sidebar"
			class:admin-editor-sidebar-collapsed={previewing}
		>
			<div class="admin-editor-metadata-sidebar-inner admin-editor-sidebar-inner">
				<div class="admin-editor-sidebar-section">
					<h2>Info</h2>
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">ID</div>
						<div class="admin-editor-metadata-id" use:copy={page.id}>
							{page.id}
						</div>
					</div>
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Status</div>
						<div class={"admin-grid-status-" + page.status}>{page.status}</div>
					</div>
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Schedule</div>
						<div
							role="presentation"
							class={"admin-editor-metadata-date"}
							onclick={() => {
								scheduledDatePicker.showPicker();
							}}
						>
							{page.publish_date == "" || page.publish_date == null
								? page.post_type.charAt(0).toUpperCase() +
									page.post_type.slice(1) +
									" is not scheduled."
								: moment.utc(page.publish_date).format("MMMM Do YYYY, h:mm a")}
							<i class="ti ti-pencil"></i>
							<input
								bind:this={scheduledDatePicker}
								bind:value={page.publish_date}
								type="datetime-local"
							/>
						</div>
					</div>
				</div>
				<div class="admin-editor-sidebar-section">
					<h2>Metadata</h2>
					<div
						class="admin-editor-metadata-group"
						class:admin-editor-metadata-group-error={titleError}
					>
						<div class="admin-editor-metadata-label">Title</div>
						<input
							type="text"
							bind:value={page.title}
							class="admin-editor-input"
						/>
					</div>
					{#if titleError}
						<div class="admin-editor-error">
							ERR: Title is empty. Please enter a title.
						</div>
					{/if}
					<div
						class="admin-editor-metadata-group"
						class:admin-editor-metadata-group-error={slugError}
					>
						<div class="admin-editor-metadata-label">Slug</div>
						<div class="admin-editor-metadata-slug">
							/{pageSlugWithoutSelfSlug}
							<input
								class="admin-editor-input"
								type="text"
								bind:value={page.self_slug}
								oninput={(e) => {
									page.self_slug = page.self_slug.toLowerCase();
									deferCheckSlugValidity();
								}}
							/>
						</div>
					</div>
					{#if slugError}
						<div class="admin-editor-error">
							ERR: {slugErrorMessage}
						</div>
					{/if}
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Excerpt</div>
						<textarea
							class="admin-editor-metadata-textarea"
							bind:value={page.excerpt}
						></textarea>
					</div>
					{#if page.post_type == "page"}
						<div class="admin-editor-metadata-group">
							<div class="admin-editor-metadata-label">Parent Page</div>
							{#if parentPage}
								<input
									type="text"
									bind:value={parentPage.title}
									disabled
									class="admin-editor-input"
								/>
							{:else}
								<input
									type="text"
									value={""}
									disabled
									class="admin-editor-input"
								/>
							{/if}
						</div>
					{:else}
						<div class="admin-editor-metadata-group">
							<div class="admin-editor-metadata-label">Categories</div>
							
							<AdminTaxonomyInput {supabase} bind:taxonomies={pageCategories} table="categories"></AdminTaxonomyInput>
						</div>
						<div class="admin-editor-metadata-group">
							<div class="admin-editor-metadata-label">Tags</div>
							<AdminTaxonomyInput {supabase} bind:taxonomies={pageTags} table="tags"></AdminTaxonomyInput>
						</div>
					{/if}
					<div class="admin-editor-metadata-group">
						<MediaLibraryInput bind:image={page.featured_image} {supabase} title="Featured Image" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div
	class="admin-editor-popover"
	bind:this={publishPopover}
	class:admin-editor-popover-show={showPublishPopover}
>
	<div
		class:display-none={showScheduleUI}
		class:display-contents={!showScheduleUI}
	>
		<button class="admin-button button-sub" onclick={publishImmediately}
			>Publish Immediately</button
		>
		<button
			class="admin-button button-sub"
			onclick={() => {
				showScheduleUI = true;
			}}>Schedule</button
		>
	</div>

	<div
		class:display-none={!showScheduleUI}
		class:display-contents={showScheduleUI}
	>
		<div
			role="presentation"
			class={"admin-editor-metadata-date"}
			onclick={() => {
				scheduledDatePickerSecondary.showPicker();
			}}
		>
			{page.publish_date == "" || page.publish_date == null
				? "Pick date and time"
				: moment.utc(page.publish_date).format("MMMM Do YYYY, h:mm a")}
			<input
				bind:this={scheduledDatePickerSecondary}
				bind:value={page.publish_date}
				type="datetime-local"
			/>
		</div>
		<button class="admin-button button-primary" onclick={schedulePublish}
			>Schedule</button
		>
	</div>
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


<style>
	.admin-editor-page-editor {
		position: relative;
		width: 100%;
		overflow-y: auto;
	}
	.display-contents {
		display: contents;
	}
	.display-none {
		display: none;
	}
</style>
