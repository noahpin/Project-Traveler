<script lang="ts">
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import type { LayoutProps } from "./$types";

	let data = $derived(page.data);
	let session = $derived(data.session);
	let pageData = $derived(data.page);
	let { children, data: layoutData } = $props();
	let pageSettings = $derived(pageData?.page_settings);
	async function trackPageView() {
		if (layoutData.deploymentEnvironment != "production") {
			return;
		}
		const url = window.location.pathname;
		const userAgent = navigator.userAgent;

		const res = fetch("https://api64.ipify.org?format=json")
			.then((response) => response.json())
			.then(({ ip }) => {
				navigator.sendBeacon(
					"/api/track",
					JSON.stringify({ url, userAgent, ip, commitSHA: layoutData.deploymentGitSHA })
				);
			});
	}
	onMount(trackPageView);
</script>

<main
	class="page-root"
>
	<header class="main-header">
		{#if session}
			<div class={"admin-header-bar admin-header-bar-" + pageData?.status}>
				<div class="admin-header-bar-area admin-header-bar-area-left">
					<a href={"admin/edit/" + pageData?.id}>Edit Page</a>
				</div>
				<div class="admin-header-bar-area admin-header-bar-area-center">
					{#if pageData?.status == "draft"}
						Draft
					{:else if pageData?.status == "scheduled"}
						Scheduled
					{/if}
				</div>
				<div class="admin-header-bar-area admin-header-bar-area-right"></div>
			</div>
		{/if}
		{#if !pageData?.page_settings?.disable_navbar}
			<div class="main-nav-content">
				<a href="/" class="main-nav-logo">
					<img src="../logo_type_transparent.svg" alt="" />
				</a>
			</div>
		{/if}
	</header>

	{@render children()}
</main>
