<script lang="ts">
	import { onMount } from "svelte";
    import AdminGrid from "$lib/components/AdminGrid.svelte";

	let { data } = $props();

	let { session, supabase } = data;
	let posts: any = $state();

	async function loadPosts() {
		const { data: pages } = await supabase
			.from("posts")
			.select("*")
            .eq("post_type", "page")
			.order("updated_at", { ascending: false })
			.range(0, 49);
		return pages;
	}

	let displayFields = [
		{
			label: "Title",
			key: "title",
		},
		{
			label: "Date",
			key: "updated_at",
		},
		{
			label: "Status",
			key: "status",
		},
		{
			label: "Scheduled Date",
			key: "scheduled_date",
		},
        {
            label: "ID",
            key: "id",
        }
	];

	onMount(async () => {
		posts = await loadPosts();
	});
</script>

<div class="admin-page-header">
	<h1>Pages</h1>
</div>

<AdminGrid {displayFields} {posts}></AdminGrid>