<script lang="ts">
    import { componentMap } from "$lib/rendererComponents";

	let { content } = $props();
	console.log(content);

</script>

{#if content}
	{#each content as block}
    {@const Block = componentMap[block.type]}
        <Block blockData={block.data} />
	{/each}
{/if}
