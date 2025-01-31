<script lang="ts">
    let {blockData}: {blockData: {content: string}} = $props();
</script>

{#if blockData}
    {@html blockData.content}
{/if}