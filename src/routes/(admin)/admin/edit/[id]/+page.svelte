<script lang="ts">
	import "$lib/layoutEditor.css";
	import Lithograph from "$lib/components/Lithograph.svelte";
	import { goto } from "$app/navigation";
	let { data } = $props();
	let { page, supabase } = $derived(data);
	let lithograph;
	// $inspect(page)

	async function updateData() {
		let data = lithograph!.getJSON();
		let content = {
			...page.content,
		};
		content.content = data;
		let { data: dat, error } = await supabase
			.from("posts")
			.update({ content: content })
			.eq("id", page.id);
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

			<a
				href={"/"+page.slug}
				target="_blank"
				class="admin-page-header-button button-sub"
			>
				Go to Live Page<i class="ti ti-external-link"></i>
			</a>
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
