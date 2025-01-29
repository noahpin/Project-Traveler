<script>
	import PageRenderer from "$lib/components/PageRenderer.svelte";
	let { data } = $props();
	let { page } = $derived(data);
	console.log(page)
</script>

{#if data.error}
    {JSON.stringify(data.error)}
{/if}
<PageRenderer content={data.page.content}></PageRenderer>
