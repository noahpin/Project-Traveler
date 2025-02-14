<script lang="ts">
	import { onMount } from "svelte";
    
	import { goto } from "$app/navigation";
    import MediaLibrary from "$lib/components/MediaLibrary.svelte";
    
	let { data } = $props();

let { session, supabase } = data;
</script>



<div class="admin-page-content">
	<div class="admin-page-header">
		<div class="admin-buttons">
			<h1>Media Library</h1>
		</div>
	</div>
    <MediaLibrary {supabase}></MediaLibrary>
</div>
