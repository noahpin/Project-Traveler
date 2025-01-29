<script lang="ts">
    import { componentMap } from "$lib/rendererComponents";
    let {blockData}: {blockData:{children: any[]}} = $props();
    let children = $derived(blockData.children);
</script>
container
{#if blockData}
	{#each children as block}
    {@const Block = componentMap[block.type]}
        <Block blockData={block.data} />
	{/each}
{/if}
