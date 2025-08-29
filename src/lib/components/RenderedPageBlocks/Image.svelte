<script lang="ts">
    let {blockData}: {blockData: {url: string}} = $props();
</script>
<div class="ancile-image">
    <img src={blockData.url} />
</div>