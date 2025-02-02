<script lang="ts">
    let {blockData}: {blockData: {url: string}} = $props();
</script>
<div class="blossom-image">
    <img src={blockData.url} />
</div>