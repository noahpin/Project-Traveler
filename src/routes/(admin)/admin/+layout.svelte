<script>
    import AdminSidebar from "$lib/components/AdminSidebar.svelte";
    let { children } = $props();
</script>

<AdminSidebar />
<main class="admin-main">
    {@render children()}
</main>
<style>
    :global(body) {
        display: flex;

    }
    main {
        width: 100%;
    }
</style>