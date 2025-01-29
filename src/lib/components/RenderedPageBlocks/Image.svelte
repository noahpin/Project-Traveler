<script lang="ts">
    let {blockData}: {blockData: {url: string}} = $props();
</script>
<img src={blockData.url} />