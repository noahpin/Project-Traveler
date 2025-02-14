<script lang="ts">
	import { onMount } from "svelte";
	import AdminGrid from "$lib/components/AdminGrid.svelte";
	import { goto } from "$app/navigation";
	import NullMarker from "$lib/components/NullMarker.svelte";
	import RefreshButton from "$lib/components/RefreshButton.svelte";
	import Pagination from "$lib/components/Pagination.svelte";

	let { data } = $props();

	let { session, supabase } = data;
	let posts: any = $state();

	let maxPageSize = 50;
	let totalCount = $state(0)
	let pageCount = $derived(Math.ceil(totalCount / maxPageSize));
	let page = $state(1);

	async function loadPosts() {
		let countQuery = supabase
			.from("posts")
			.select("count")
			.eq("post_type", "post")
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
				"*,post_tags(tag:tags(*)),post_categories(category:categories(*))"
			)
			.eq("post_type", "post")
			.order("updated_at", { ascending: false })
			.range((page-1) * maxPageSize, (page * maxPageSize) - 1)
		if(searchQuery != "") {
			query.ilike("title", `%${searchQuery}%`);
		}
		let { data: posts } = await query
		return posts;
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
			label: "Tags",
			renderer: tagList,
		},
		{
			label: "Categories",
			renderer: categoryList,
		},
		{
			label: "ID",
			key: "id",
		},
	];

	async function newPost() {
		let { data, error } = await supabase
			.from("posts")
			.insert([{ post_type: "post" }])
			.select()
			.single();
		goto(`/admin/edit/${data.id}`);
	}


	async function deleteSelectedPosts() {
		let selected = selectedRows.map((selected, i) => {
			if (selected) {
				return posts[i].id;
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
		posts = null;
		posts = await loadPosts();
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
		posts = await loadPosts();
	});
</script>

{#snippet tagList(data: any)}
	<div class="admin-chip-list">
		{#if data.post_tags.length == 0}
			<NullMarker></NullMarker>
		{/if}
		{#each data.post_tags as tag, i}
			<span class="admin-chip">{tag.tag.name}</span>
		{/each}
	</div>
{/snippet}
{#snippet categoryList(data: any)}
	<div class="admin-chip-list">
		{#if data.post_categories.length == 0}
			<NullMarker></NullMarker>
		{/if}
		{#each data.post_categories as category, i}
			<span class="admin-chip">{category.category.name}</span>
		{/each}
	</div>
{/snippet}


<div class="admin-page-content">
	<div class="admin-page-header">
		<div class="admin-buttons">
			<h1>Posts</h1>

				<RefreshButton {refresh}></RefreshButton>
				{#if anySelected}
				{@const count = selectedRows.filter(Boolean).length}
				{count} post{count > 1 ? "s" : ""} selected
					<button
						class="admin-button button-delete"
						onclick={deleteSelectedPosts}>Delete</button
					>
					{:else}
					<p>
						{totalCount} posts</p>
					<Pagination {pageCount} onChange={pageChange} bind:page={page}></Pagination>
					<input class="admin-editor-input" type="text" placeholder="Search..." bind:value={searchQueryInput} onkeydown={(e)=>{
						if(e.key == "Enter") {
							search();
						}
					}}/>
					<button aria-label="search" class="button-icon button-primary admin-button" onclick={search}>
						<i class="ti ti-search"></i>
					</button>
					<button onclick={newPost} class="admin-button button-primary">
						<i class="ti ti-plus"></i>
						New Post
					</button>
				{/if}
		</div>
	</div>

	<AdminGrid
		{displayFields}
		data={posts}
		editURL={"/admin/edit/"}
		bind:selectedRows={selectedRows}
		columnWidths={"45px 225px 200px 180px 280px 120px 260px 200px 360px"}
	></AdminGrid>
</div>


<style>
	p {
		font-family: "Geist Mono";
	}
</style>