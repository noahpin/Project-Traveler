<script>
	import PageRenderer from "$lib/components/PageRenderer.svelte";
	let { data } = $props();
	let { page } = $derived(data);
</script>

<svelte:head>
	<title>
		{page.title}
	</title>
	<meta name="description" content={page.excerpt} />
	<meta property="og:title" content={page.title} />
	<meta property="og:description" content={page.excerpt} />
</svelte:head>

{#if page}
		<PageRenderer content={data.page.content}></PageRenderer>
{/if}
