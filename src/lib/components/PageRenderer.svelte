<script lang="ts">
	import { componentMap } from "$lib/rendererComponents";

	let { content, overrides = {backgroundColor: null, bodyTextColor: null} }: {content: {content: any[], flex: boolean | null}, overrides?: {
		backgroundColor: string | null,
		bodyTextColor: string | null
	}} = $props();
</script>

<div class={"blossom-page-root " + (content.flex ? "blossom-flex" : "")} style:background={overrides.backgroundColor} style:color={overrides.bodyTextColor}>
	{#if content}
		{#each content.content as block}
			{@const Block = componentMap[block.type]}
			<Block blockData={block.data} />
		{/each}
	{/if}
</div>
