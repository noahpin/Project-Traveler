<script lang="ts">
	import { onMount } from "svelte";
	import AdminGrid from "$lib/components/AdminGrid.svelte";
	import { goto } from "$app/navigation";
	import RefreshButton from "$lib/components/RefreshButton.svelte";
	import Pagination from "$lib/components/Pagination.svelte";

	let { data } = $props();

	let { session, supabase } = data;
	let categories: any = $state();

	let maxPageSize = 50;
	let totalCount = $state(0)
	let pageCount = $derived(Math.ceil(totalCount / maxPageSize));
	let page = $state(1);


	async function loadCategories() {
		let countQuery = supabase
			.from("categories")
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
			.from("categories")
			.select("*,post_categories(count)")
			.order("name", { ascending: true })
			.range((page-1) * maxPageSize, (page * maxPageSize) - 1)
		if(searchQuery != "") {
			query.ilike("name", `%${searchQuery}%`);
		}
		let { data: categories } = await query
		categories =
		categories?.map((category) => {
			category.count = category.post_categories[0].count;
				return category;
			}) ?? null;
		return categories;
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
	let categoryInputName = $state("");
	let categoryInputSlug = $state("");
	let categoryInputDescription = $state("");
	let anySelected = $derived(selectedRows.includes(true));
	async function newCategory() {

        if(await slugCheck()) return;
		let { data, error } = await supabase
			.from("categories")
			.insert({
				name: categoryInputName,
				slug: categoryInputSlug,
				description: categoryInputDescription,
			});
		refresh();
	}

	onMount(async () => {
		refresh();
	});

	async function refresh() {
		categories = null;
		categories = await loadCategories();
		selectedRows = new Array(maxPageSize).fill(false);
	}
	let editCategory = $state(false);
	interface Category {
		id: number;
		name: string;
		slug: string;
		description: string;
		post_categories: { count: number }[];
	}

	let editCategoryData: Category | null = $state(null);
	function openCategory(data: any) {
        slugError = false;
        editCategoryData = data;
        categoryInputName = data.name;
        categoryInputSlug = data.slug;
        categoryInputDescription = data.description;
		editCategory = true;
	}

	function cancelEditCategory() {
        slugError = false;

        editCategoryData = null;
        categoryInputName = "";
        categoryInputSlug = ""
        categoryInputDescription = "";
		editCategory = false;
	}

    let slugError = $state(false);

    async function slugCheck(): Promise<boolean> {
        slugError = false;
        let query =  supabase
            .from("categories")
            .select("slug")
            .eq("slug", categoryInputSlug)
        if(editCategoryData) {
            query = query.neq("id", editCategoryData.id);
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

    async function updateCategory() {
        if(!editCategoryData || editCategoryData == null) return;
        //see if the slug 
        if(await slugCheck()) return;

        let { data, error } = await supabase
            .from("categories")
            .update({
                name: categoryInputName,
                slug: categoryInputSlug,
                description: categoryInputDescription,
            })
            .eq("id", editCategoryData.id);
        refresh();
        cancelEditCategory();
    }

	async function deleteSelectedCategories() {
		let selected = selectedRows.map((selected, i) => {
			if (selected) {
				return categories[i].id;
			}
		});
		selected = selected.filter(Boolean); 	//cheeky way of filtering only non-null values, because anything that isnt undefined is true
		let { data, error } = await supabase
			.from("categories")
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
			<h1>Categories</h1>
			<RefreshButton {refresh}></RefreshButton>
			{#if anySelected}
			{@const count = selectedRows.filter(Boolean).length}
			{count} categor{count > 1 ? "ies" : "y"} selected
				<button
					class="admin-button button-delete"
					onclick={deleteSelectedCategories}>Delete</button
				>
				{:else}
				<p>{totalCount} categories</p>
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
				data={categories}
				callback={openCategory}
				columnWidths={"45px 200px 200px 1fr"}
				bind:selectedRows={selectedRows}
			></AdminGrid>
		</div>
		<div class="admin-editor-column">
			<h2>{editCategory ? "Edit Category" : "Add New Category"}</h2>
			<div class="admin-editor-metadata-group">
				<div class="admin-editor-metadata-label">Title</div>
				<input
					type="text"
					bind:value={categoryInputName}
					class="admin-editor-input"
				/>
			</div>
			<div class="admin-editor-metadata-group" class:admin-editor-metadata-group-error={slugError}>
				<div class="admin-editor-metadata-label">Slug</div>
				<div class="admin-editor-metadata-slug">
					/categories/
					<input
						class="admin-editor-input"
						bind:value={categoryInputSlug}
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
						bind:value={categoryInputDescription}
					></textarea>
				</div>
			</div>

			{#if editCategory}
				<div class="flex-hor">
					<button
						class="admin-button button-primary"
						onclick={updateCategory}>Update</button
					>
					<button
						class="admin-button button-sub"
						onclick={cancelEditCategory}>Cancel</button
					>
				</div>
			{:else}
				<div class="flex-hor">
					<button
						class="admin-button button-primary"
						onclick={newCategory}>Add</button
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