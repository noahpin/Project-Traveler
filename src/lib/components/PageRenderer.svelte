<script lang="ts">
	import { componentMap } from "$lib/rendererComponents";
	import {getPostData} from "$lib/rendererUtil";

	let { content, settings, injectCSS = true, postBlockData = []}: {
		content: {content: any[], flex: boolean | null}, 
		injectCSS?: boolean, 
		settings: {
		disable_navbar: boolean;
		css: string;
	}, postBlockData?: any[]} = $props();
	
</script>

<svelte:head>
	{#if injectCSS}
	{@html "<style>" + settings.css + "</style>"} <!----TODO: LINT THIS-->
	{/if}
</svelte:head>


<div class={"ancile-page-root " + (content.flex ? "ancile-flex" : "")}>
	{#if content}
		{#each content.content as block}
			{@const Block = componentMap[block.type]}
			<Block blockData={block.data} {postBlockData} blockId={block.id} />
		{/each}
	{/if}
</div>
