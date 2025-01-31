<script lang="ts">
	import { componentMap } from "$lib/rendererComponents";

	let { content }: {content: {content: any[], flex: boolean | null}} = $props();
</script>

<div class={"traveler-page-root " + (content.flex ? "traveler-flex" : "")}>
	{#if content}
		{#each content.content as block}
			{@const Block = componentMap[block.type]}
			<Block blockData={block.data} />
		{/each}
	{/if}
</div>
