<script lang="ts">
	import { onMount } from "svelte";
	import AdminGrid from "$lib/components/AdminGrid.svelte";
	import { goto } from "$app/navigation";
	import NullMarker from "$lib/components/NullMarker.svelte";
	import RefreshButton from "$lib/components/RefreshButton.svelte";
	import Pagination from "$lib/components/Pagination.svelte";

	let { data } = $props();

	let { session, supabase } = data;
	let pages: any = $state();

	let maxPageSize = 50;
	let totalCount = $state(0)
	let pageCount = $derived(Math.ceil(totalCount / maxPageSize));
	let page = $state(1);

	async function loadPages() {
		let countQuery = supabase
			.from("posts")
			.select("count")
			.eq("post_type", "page")
		if(searchQuery != "") {
			countQuery.ilike("title", `%${searchQuery}%`);
		}
		let {data: count} = await countQuery.single()
		totalCount = count?.count ?? 0;
		if(page > pageCount) {
			page = pageCount;
		}
		let query = supabase
			.from("posts")
			.select(
				"*"
			)
			.eq("post_type", "page")
			.order("updated_at", { ascending: false })
			.range((page-1) * maxPageSize, (page * maxPageSize) - 1)
		if(searchQuery != "") {
			query.ilike("title", `%${searchQuery}%`);
		}
		let { data: pages } = await query
		return pages;
	}

	let displayFields = [
		{
			label: "Title",
			key: "title",
		},
		{
			label: "Slug",
			key: "slug",
		},
		{
			label: "Updated At",
			key: "updated_at",
		},
		{
			label: "Scheduled Date",
			key: "publish_date",
		},
		{
			label: "Status",
			key: "status",
		},
		{
			label: "ID",
			key: "id",
		},
	];

	async function newPage() {
		let { data, error } = await supabase
			.from("posts")
			.insert([{ post_type: "page" }])
			.select()
			.single();
		goto(`/admin/edit/${data.id}`);
	}


	async function deleteSelectedPages() {
		let selected = selectedRows.map((selected, i) => {
			if (selected) {
				return pages[i].id;
			}
		});
		selected = selected.filter(Boolean); 	//cheeky way of filtering only non-null values, because anything that isnt undefined is true
		let { data, error } = await supabase
			.from("posts")
			.delete()
			.in("id", selected);
		refresh();
	}

	async function refresh() {
		pages = null;
		pages = await loadPages();
		selectedRows = new Array(maxPageSize).fill(false);
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

	let selectedRows = $state(new Array(maxPageSize).fill(false));
	let anySelected = $derived(selectedRows.includes(true));

	onMount(async () => {
		pages = await loadPages();
	});
</script>

<div class="admin-page-content">
	<div class="admin-page-header">
		<div class="admin-buttons">
			<h1>Pages</h1>

				<RefreshButton {refresh}></RefreshButton>
				{#if anySelected}
				{@const count = selectedRows.filter(Boolean).length}
				{count} page{count > 1 ? "s" : ""} selected
					<button
						class="admin-button button-delete"
						onclick={deleteSelectedPages}>Delete</button
					>
					{:else}
					<p>{totalCount} pages</p>
					<Pagination {pageCount} onChange={pageChange} bind:page={page}></Pagination>
					<input class="admin-editor-input" type="text" placeholder="Search..." bind:value={searchQueryInput} onkeydown={(e)=>{
						if(e.key == "Enter") {
							search();
						}
					}}/>
					<button aria-label="search" class="button-icon button-primary admin-button" onclick={search}>
						<i class="ti ti-search"></i>
					</button>
					<button onclick={newPage} class="admin-button button-primary">
						<i class="ti ti-plus"></i>
						New Page
					</button>
				{/if}
		</div>
	</div>

	<AdminGrid
		{displayFields}
		data={pages}
		editURL={"/admin/edit/"}
		bind:selectedRows={selectedRows}

		columnWidths={"45px 225px 200px 180px 280px 120px 360px"}
	></AdminGrid>
</div>


<style>
	p {
		font-family: "Geist Mono";
	}
</style>