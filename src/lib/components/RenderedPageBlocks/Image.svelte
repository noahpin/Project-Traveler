<script lang="ts">
    let {blockData}: {blockData: {url: string}} = $props();
</script>
<div class="traveler-image">
    <img src={blockData.url} />
</div>