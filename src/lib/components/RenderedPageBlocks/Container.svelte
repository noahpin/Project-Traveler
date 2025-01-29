<script lang="ts">
	import { componentMap } from "$lib/rendererComponents";
	let {
		blockData,
	}: {
		blockData: {
			children: any[];
			size: { numerator: number; denominator: number };
		};
	} = $props();
	let children = $derived(blockData.children);
</script>

<div
	class="traveler-container"
	style:width={`${(blockData.size.numerator / blockData.size.denominator) * 100}%`}
>
	{#if blockData}
		{#each children as block}
			{@const Block = componentMap[block.type]}
			<Block blockData={block.data} />
		{/each}
	{/if}
</div>
