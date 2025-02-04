<script>
	import PageRenderer from "$lib/components/PageRenderer.svelte";
	let { data } = $props();
	let { page } = $derived(data);
</script>

<svelte:head>
	<title>
		{page.title}
	</title>
</svelte:head>

{#if page}
<PageRenderer content={data.page.content}></PageRenderer>
{/if}