<script lang="ts">
	import { onMount } from "svelte";
	import AdminGrid from "$lib/components/AdminGrid.svelte";
	import { goto } from "$app/navigation";

	let { data } = $props();

	let { session, supabase } = data;
	let categories: any = $state();

	async function loadCategories() {
		let { data: categories } = await supabase
			.from("categories")
			.select("*,post_categories(count)")
			.range(0, 49);
		categories = categories?.map(category => {
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
		{
			label: "ID",
			key: "id"
		}
	];

	async function newCategory() {
	}

	onMount(async () => {
		categories = await loadCategories();
	});
</script>

<div class="admin-page-content">
	<div class="admin-page-header">
		<h1>Categories</h1>

        <div class="admin-buttons">
            <button onclick={newCategory} class="admin-button button-primary">
				<i class="ti ti-plus"></i>
				New Category
            </button>
        </div>
	</div>

	<AdminGrid {displayFields} data={categories} editURL={"/admin/edit-tag/"} columnWidths={"45px 200px 200px 100px 1fr"}></AdminGrid>
</div>
