<script lang="ts">
    let {blockData}: {blockData: {content: string}} = $props();
    console.log(blockData);
</script>

{#if blockData}
    {@html blockData.content}
{/if}