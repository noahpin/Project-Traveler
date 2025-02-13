<script lang="ts">
    
    let {color = $bindable("#ffffff")}: {color: string} = $props();
</script>

<div class="admin-color-input-wrapper" style:background={color}>
    <input class="admin-color-input" type="color" bind:value={color} />
</div>
