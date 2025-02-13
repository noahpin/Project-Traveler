<script lang="ts">
	import moment from "moment";
	//@ts-ignore
	import { DateTime } from "luxon";
	import "$lib/layoutEditor.css";
	import Lithograph from "$lib/components/Lithograph.svelte";
	import { goto } from "$app/navigation";
	import { getPage } from "$lib/supabaseHelpers";
	import PageRenderer from "$lib/components/PageRenderer.svelte";
	import Color from "@tiptap/extension-color";
	import ColorInput from "$lib/components/ColorInput.svelte";
	import CheckboxInput from "$lib/components/CheckboxInput.svelte";
	import { computePosition } from "@floating-ui/core";
	import { platform, flip, offset, shift } from "@floating-ui/dom";
	import { createPopper } from "@popperjs/core";

	import { onMount } from "svelte";
	let { data } = $props();
	let { page: originalPageData, supabase } = $derived(data);
	// svelte-ignore state_referenced_locally
	// svelte-ignore state_referenced_locally
	let page = $state(originalPageData);
	//make this local
	console.log(DateTime.fromISO(page.publish_date).toISO());
	page.publish_date = page.publish_date
		? DateTime.fromISO(page.publish_date).toISO().slice(0, 16)
		: "";
	$inspect(page.publish_date);
	let lithograph;
	let pageSlugWithoutSelfSlug = page.slug.replace(page.self_slug, "");
	let parentPage: any = $state(null);
	if (page.parent_id) {
		checkForParent();
	}

	async function checkForParent() {
		const { page: pg, error } = await getPage(supabase, page.parent_id);
		parentPage = pg;
		console.log(parentPage);
	}

	let pageSettings: {
		disable_navbar: boolean;
		page_background_color: string;
		page_text_color: string;
	} = $derived(page.page_settings);

	// svelte-ignore state_referenced_locally
	let disableNavbar = $state(pageSettings?.disable_navbar ?? false);
	// svelte-ignore state_referenced_locally
	let pageBackgroundColor = $state(
		pageSettings?.page_background_color ?? "#ffffff"
	);
	// svelte-ignore state_referenced_locally
	let pageTextColor = $state(pageSettings?.page_text_color ?? "#000000");

	let updatingData = $state(false);
	async function updateData() {
		showPublishPopover = false;
		let data = lithograph!.getJSON();
		let pageData = $state.snapshot(page);
		let timeStart = Date.now();
		updatingData = true;
		pageData.content = { content: data };
		pageData.page_settings = {
			disable_navbar: disableNavbar,
			page_background_color: pageBackgroundColor,
			page_text_color: pageTextColor,
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
		console.log(diff);
		if (diff.publish_date) {
			diff.publish_date = DateTime.fromISO(diff.publish_date).toISO();
			if (page.status == "draft") {
				diff.status = "scheduled";
				page.status = "scheduled";
			}
		}
		let { data: dat, error } = await supabase
			.from("posts")
			.update(diff)
			.eq("id", page.id);
		if (error) {
			console.error(error);
		} else {
			console.log(dat);
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
	$inspect(page);

	let scheduledDatePicker: HTMLInputElement;
	let scheduledDatePickerSecondary: HTMLInputElement;
	//TODO: make this reversible
	function preview() {
		previewing = true;
		pageRendererData = { content: lithograph!.getJSON(), flex: true }; //TODO: make flex be accurate to what is in the lithograph
	}

	function publishImmediately() {
		page.status = "published";
		showPublishPopover = false;
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
	onMount(() => {
		console.log(publishButton, publishPopover);
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
		<div class="admin-editor-page-editor">
			<!-- TODO: make it so that this doesnt delete the lithograph or pagerenderer object, and just hides them. maybe destroys pagerenderer but not lithograph so that it doesnt lose data.-->
			<Lithograph
				bind:this={lithograph}
				hide={previewing}
				lithographData={page.content}
			/>
			{#if previewing}
				<PageRenderer
					content={pageRendererData}
					overrides={{
						backgroundColor: pageBackgroundColor,
						bodyTextColor: pageTextColor,
					}}
				></PageRenderer>
			{/if}
		</div>

		<div
			class="admin-editor-metadata-sidebar"
			class:admin-editor-metadata-sidebar-collapsed={previewing}
		>
			<div class="admin-editor-metadata-sidebar-inner">
				<div class="admin-editor-sidebar-section">
					<h2>Info</h2>
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">ID</div>
						<div class="admin-editor-metadata-id">{page.id}</div>
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
								? page.post_type.charAt(0).toUpperCase() + page.post_type.slice(1) + " is not scheduled."
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
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Title</div>
						<input
							type="text"
							bind:value={page.title}
							class="admin-editor-input"
						/>
					</div>
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Slug</div>
						<div class="admin-editor-metadata-slug">
							/{pageSlugWithoutSelfSlug}
							<input
								class="admin-editor-input"
								type="text"
								bind:value={page.self_slug}
							/>
						</div>
					</div>
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Excerpt</div>
						<textarea
							class="admin-editor-metadata-textarea"
							bind:value={page.excerpt}
						></textarea>
					</div>
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
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Categories</div>
						<input type="text" value={""} disabled class="admin-editor-input" />
					</div>
					<div class="admin-editor-metadata-group">
						<div class="admin-editor-metadata-label">Tags</div>
						<input type="text" value={""} disabled class="admin-editor-input" />
					</div>
				</div>
				<div class="admin-editor-sidebar-section">
					<h2>Settings</h2>
					<div
						class="admin-editor-metadata-group admin-editor-metadata-group-horizontal"
					>
						<div class="admin-editor-metadata-label">Disable Navbar</div>
						<CheckboxInput bind:value={disableNavbar} />
					</div>
					<div
						class="admin-editor-metadata-group admin-editor-metadata-group-horizontal"
					>
						<div class="admin-editor-metadata-label">Page Background Color</div>
						<ColorInput bind:color={pageBackgroundColor} />
					</div>
					<div
						class="admin-editor-metadata-group admin-editor-metadata-group-horizontal"
					>
						<div class="admin-editor-metadata-label">Page Text Color</div>
						<ColorInput bind:color={pageTextColor} />
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
	<div class:display-none={showScheduleUI} class:display-contents={!showScheduleUI}>
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

	<div class:display-none={!showScheduleUI} class:display-contents={showScheduleUI}>
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
		<button class="admin-button button-primary" onclick={updateData}
			>Schedule</button
		>
	</div>
</div>

<style>
	.admin-editor-page-editor {
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
