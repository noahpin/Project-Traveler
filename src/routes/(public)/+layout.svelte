<script>
	import { page } from "$app/state";
	let data = $derived(page.data);
	let session = $derived(data.session);
	let pageData = $derived(data.page);
	let { children } = $props();
	let pageSettings = $derived(pageData?.page_settings);
	// svelte-ignore state_referenced_locally
	let pageBackgroundColor = $state(pageSettings?.page_background_color ?? null);
	// svelte-ignore state_referenced_locally
	let pageTextColor = $state(pageSettings?.page_text_color ?? null);
	// console.log(page.url)
</script>

<main class="page-root" style:background={pageBackgroundColor} style:color={pageTextColor}>
	<header class="main-header">
		{#if session}
			{#if pageData?.status == "draft"}
				<div class="admin-header-bar admin-header-bar-draft">Draft</div>
			{:else if pageData?.status == "scheduled"}
				<div class="admin-header-bar admin-header-bar-scheduled">Scheduled</div>
			{/if}
		{/if}
		{#if !pageData?.page_settings?.disable_navbar}
			<div class="main-nav-content">
				<a href="/" class="main-nav-logo">
					<img src="./logo_type_transparent.svg" alt="" />
				</a>
			</div>
		{/if}
	</header>

	{@render children()}
</main>
