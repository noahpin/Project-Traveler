<script>
	import PageRenderer from "$lib/components/PageRenderer.svelte";
	let { data } = $props();
	let { page, postBlockData } = $derived(data);
	$inspect(postBlockData)
</script>

<svelte:head>
	<title>
		{page.title}
	</title>
	<meta name="description" content={page.excerpt} />
	<meta property="og:title" content={page.title} />
	<meta property="og:description" content={page.excerpt} />
</svelte:head>

{#if page && page.content && page.page_settings}
		<PageRenderer content={data.page.content} {postBlockData} settings={data.page.page_settings}></PageRenderer>
{/if}
