<script lang="ts">
	import { onMount } from "svelte";
	import AdminGrid from "$lib/components/AdminGrid.svelte";
	import { goto } from "$app/navigation";

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
			key: "slug",
		},
		{
			label: "Updated At",
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
			key: "id"
		}
	];

	async function newPost() {
		let {data, error} = await supabase.from('posts').insert([{post_type: 'post'}]).select().single();
		goto(`/admin/edit/${data.id}`);
	}

	onMount(async () => {
		posts = await loadPosts();
	});
</script>

<div class="admin-page-content">
	<div class="admin-page-header">
		<h1>Posts</h1>

        <div class="admin-page-header-buttons">
            <button onclick={newPost} class="admin-page-header-button button-green">
				<i class="ti ti-plus"></i>
				New Post
            </button>
        </div>
	</div>

	<AdminGrid {displayFields} {posts}></AdminGrid>
</div>
