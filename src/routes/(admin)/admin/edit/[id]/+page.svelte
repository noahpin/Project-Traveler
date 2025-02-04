<script lang="ts">
	import "$lib/layoutEditor.css";
	import Lithograph from "$lib/components/Lithograph.svelte";
	import { goto } from "$app/navigation";
	let { data } = $props();
	let { page, supabase } = $derived(data);
	let lithograph;

	async function updateData() {
		let data = lithograph!.getJSON();
		let content = {
			...page.content,
		};
		content.content = data;
		console.log(page);
		console.log(data);
		let { data: dat, error } = await supabase
			.from("posts")
			.update({ content: content })
			.eq("id", page.id);
		console.log(dat, error);
	}
</script>

<div class="admin-page-content">
	<div class="admin-page-header">
        <div class="admin-page-header-buttons">
		<button onclick={()=>goto("/admin/" + page.post_type + "s")} class="admin-header-tame-button" aria-label="Go back">
			<i class="ti ti-arrow-left"></i>
		</button>
		<h1>Edit {page.post_type}</h1></div>
		<div class="admin-page-header-buttons">
			<button
				onclick={updateData}
				class="admin-page-header-button button-green"
			>
				Update
			</button>
		</div>
	</div>
	<div class="admin-editor">
		<Lithograph bind:this={lithograph} lithographData={page.content} />
	</div>
</div>
