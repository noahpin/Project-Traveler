<script lang="ts">
	import { componentMap } from "$lib/rendererComponents";

	let { content, settings, injectCSS = true}: {content: {content: any[], flex: boolean | null}, injectCSS?: boolean, settings: {
		disable_navbar: boolean;
		css: string;
	}} = $props();
</script>

<svelte:head>
	{#if injectCSS}
	{@html "<style>" + settings.css + "</style>"}
	{/if}
</svelte:head>


<div class={"blossom-page-root " + (content.flex ? "blossom-flex" : "")}>
	{#if content}
		{#each content.content as block}
			{@const Block = componentMap[block.type]}
			<Block blockData={block.data} />
		{/each}
	{/if}
</div>
