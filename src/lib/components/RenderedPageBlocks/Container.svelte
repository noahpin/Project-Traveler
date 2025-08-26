<script lang="ts">
	import { componentMap } from "$lib/rendererComponents";
	let {
		blockData,
		postBlockData = [],
		blockId = ""
	}: {
		blockData: {
			children: any[];
			size: { numerator: number; denominator: number };
		};
		postBlockData?: any[];
		blockId: string;
	} = $props();
	let children = $derived(blockData.children);
</script>

<div
	class="blossom-container"
	style:width={`${(blockData.size.numerator / blockData.size.denominator) * 100}%`}
>
	{#if blockData}
		{#each children as block}
			{@const Block = componentMap[block.type]}
			<Block blockData={block.data} {postBlockData} blockId={block.id} />
		{/each}
	{/if}
</div>
