<script lang="ts">
	import { onMount } from "svelte";
	import AdminGrid from "$lib/components/AdminGrid.svelte";
	import { goto } from "$app/navigation";
	import RefreshButton from "$lib/components/RefreshButton.svelte";
	import Pagination from "$lib/components/Pagination.svelte";

	let { data } = $props();

	let { session, supabase } = data;
	let tags: any = $state();

	let maxPageSize = 50;
	let totalCount = $state(0)
	let pageCount = $derived(Math.ceil(totalCount / maxPageSize));
	let page = $state(1);


	async function loadTags() {
		let countQuery = supabase
			.from("tags")
			.select("count")
		if(searchQuery != "") {
			countQuery.ilike("name", `%${searchQuery}%`);
		}
		let {data: count} = await countQuery.single()
		totalCount = count?.count ?? 0;
		if(page > pageCount) {
			page = pageCount;
		}
		let query = supabase
			.from("tags")
			.select("*,post_tags(count)")
			.order("name", { ascending: true })
			.range((page-1) * maxPageSize, (page * maxPageSize) - 1)
		if(searchQuery != "") {
			query.ilike("name", `%${searchQuery}%`);
		}
		let { data: tags } = await query
		tags =
			tags?.map((tag) => {
				tag.count = tag.post_tags[0].count;
				return tag;
			}) ?? null;
		return tags;
	}

	let displayFields = [
		{
			label: "Name",
			key: "name",
		},
		{
			label: "Slug",
			key: "slug",
		},
		{
			label: "Count",
			key: "count",
		},
	];
	let selectedRows = $state(new Array(maxPageSize).fill(false));
	let tagInputName = $state("");
	let tagInputSlug = $state("");
	let tagInputDescription = $state("");
	let anySelected = $derived(selectedRows.includes(true));
	async function newTag() {

        if(await slugCheck()) return;
		let { data, error } = await supabase
			.from("tags")
			.insert({
				name: tagInputName,
				slug: tagInputSlug,
				description: tagInputDescription,
			});
		refresh();
	}

	onMount(async () => {
		refresh();
	});

	async function refresh() {
		tags = null;
		tags = await loadTags();
		selectedRows = new Array(maxPageSize).fill(false);
	}
	let editTag = $state(false);
	interface Tag {
		id: number;
		name: string;
		slug: string;
		description: string;
		post_tags: { count: number }[];
	}

	let editTagData: Tag | null = $state(null);
	function openTag(data: any) {
        slugError = false;
        editTagData = data;
        tagInputName = data.name;
        tagInputSlug = data.slug;
        tagInputDescription = data.description;
		editTag = true;
	}

	function cancelEditTag() {
        slugError = false;

        editTagData = null;
        tagInputName = "";
        tagInputSlug = ""
        tagInputDescription = "";
		editTag = false;
	}

    let slugError = $state(false);

    async function slugCheck(): Promise<boolean> {
        slugError = false;
        let query =  supabase
            .from("tags")
            .select("slug")
            .eq("slug", tagInputSlug)
        if(editTagData) {
            query = query.neq("id", editTagData.id);
        }

        let { data, error } = await query;
        if(data && data.length > 0) {
            slugError = true;
            return true;
        } else {
            slugError = false;
            return false;
        }
    }

    async function updateTag() {
        if(!editTagData || editTagData == null) return;
        //see if the slug 
        if(await slugCheck()) return;

        let { data, error } = await supabase
            .from("tags")
            .update({
                name: tagInputName,
                slug: tagInputSlug,
                description: tagInputDescription,
            })
            .eq("id", editTagData.id);
        refresh();
        cancelEditTag();
    }

	async function deleteSelectedTags() {
		let selected = selectedRows.map((selected, i) => {
			if (selected) {
				return tags[i].id;
			}
		});
		selected = selected.filter(Boolean); 	//cheeky way of filtering only non-null values, because anything that isnt undefined is true
		let { data, error } = await supabase
			.from("tags")
			.delete()
			.in("id", selected);
		refresh();
	}

	function pageChange(newPage: number) {
		page = newPage;
		refresh();
	}

	let searchQueryInput = $state("");
	let searchQuery = $state("");

	function search() {
		searchQuery = searchQueryInput;
		refresh();
	}

</script>

<div class="admin-page-content">
	<div class="admin-page-header">
		<div class="admin-buttons">
			<h1>Tags</h1>
			<RefreshButton {refresh}></RefreshButton>
			{#if anySelected}
			{@const count = selectedRows.filter(Boolean).length}
			{count} tag{count > 1 ? "s" : ""} selected
				<button
					class="admin-button button-delete"
					onclick={deleteSelectedTags}>Delete</button
				>
				{:else}
				<p>{totalCount} tags</p>
				<Pagination {pageCount} onChange={pageChange} bind:page={page}></Pagination>
				<input class="admin-editor-input" type="text" placeholder="Search..." bind:value={searchQueryInput} onkeydown={(e)=>{
					if(e.key == "Enter") {
						search();
					}
				}}/>
				<button aria-label="search" class="button-icon button-primary admin-button" onclick={search}>
					<i class="ti ti-search"></i>
				</button>
			{/if}
		</div>
	</div>
	<div class="admin-editor">
		<div class="admin-editor-fullwidth">
			<AdminGrid
				{displayFields}
				data={tags}
				callback={openTag}
				columnWidths={"45px 200px 200px 1fr"}
				bind:selectedRows={selectedRows}
			></AdminGrid>
		</div>
		<div class="admin-editor-column">
			<h2>{editTag ? "Edit Tag" : "Add New Tag"}</h2>
			<div class="admin-editor-metadata-group">
				<div class="admin-editor-metadata-label">Title</div>
				<input
					type="text"
					bind:value={tagInputName}
					class="admin-editor-input"
				/>
			</div>
			<div class="admin-editor-metadata-group" class:admin-editor-metadata-group-error={slugError}>
				<div class="admin-editor-metadata-label">Slug</div>
				<div class="admin-editor-metadata-slug">
					/tags/
					<input
						class="admin-editor-input"
						bind:value={tagInputSlug}
						type="text"
					/>
				</div>
			</div>
            {#if slugError}
            <div class="admin-editor-error">
                This slug already exists, please choose another.
            </div>
            {/if}
			<div class="admin-editor-metadata-group">
				<div class="admin-editor-metadata-label">Description</div>
				<div class="admin-editor-metadata-slug">
					<textarea
						class="admin-editor-metadata-textarea"
						bind:value={tagInputDescription}
					></textarea>
				</div>
			</div>

			{#if editTag}
				<div class="flex-hor">
					<button
						class="admin-button button-primary"
						onclick={updateTag}>Update</button
					>
					<button
						class="admin-button button-sub"
						onclick={cancelEditTag}>Cancel</button
					>
				</div>
			{:else}
				<div class="flex-hor">
					<button
						class="admin-button button-primary"
						onclick={newTag}>Add</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>


<style>
	p {
		font-family: "Geist Mono";
	}
</style>