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
            .eq("post_type", "post")
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
            label: "Slug",
            "key": "slug",
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
	];

	onMount(async () => {
		posts = await loadPosts();
	});
</script>

<div class="admin-page-header">
	<h1>Posts</h1>
</div>

<AdminGrid {displayFields} {posts}></AdminGrid>