<script lang="ts">
	import { onMount } from "svelte";

	import { goto } from "$app/navigation";
	import MediaLibrary from "$lib/components/MediaLibrary.svelte";

	let { data } = $props();

	let { session, supabase } = data;
	let selectedItem: any= $state(null);
</script>
<MediaLibrary {supabase} bind:selectedItem></MediaLibrary>
