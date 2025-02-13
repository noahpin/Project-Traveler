<script lang="ts">
    let { refresh }: { refresh: () => Promise<void> } = $props();
    let loading = $state(false);

    async function refreshButton() {
        loading = true;
        refresh().then(() => {
            loading = false;
        }); 
    }
</script>

<button aria-label="refresh" class="admin-header-tame-button" onclick={refreshButton}>
    {#if loading}
        <i class="ti ti-loader-2 spin"></i>
    {:else}
        <i class="ti ti-reload"></i>
    {/if}
</button>