<script>
	import PageRenderer from "$lib/components/PageRenderer.svelte";
	let { data } = $props();
	let { page } = $derived(data);
</script>

{#if page}
<PageRenderer content={data.page.content}></PageRenderer>
{/if}