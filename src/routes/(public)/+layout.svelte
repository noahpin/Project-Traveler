<script>
	import { page } from "$app/state";
	let data = $derived(page.data);
	let session = $derived(data.session);
	let pageData = $derived(data.page);
	let { children } = $props();
	console.log("PUBLIC LAYOUT LOADED");
	// $inspect(data, pageData);
</script>

<header class="main-header">
	{#if session}
		{#if pageData.status == "draft"}
			<div class="admin-header-bar admin-header-bar-draft">Draft</div>
		{:else if pageData.status == "scheduled"}
			<div class="admin-header-bar admin-header-bar-scheduled">Scheduled</div>
		{/if}
	{/if}
	<h1>navbar</h1>
</header>

{@render children()}
