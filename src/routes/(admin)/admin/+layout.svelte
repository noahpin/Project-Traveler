<script>
    import AdminSidebar from "$lib/components/AdminSidebar.svelte";
    let { children, data } = $props();
    let { supabase } = $derived(data);
</script>

<div class="admin-root">

<AdminSidebar {supabase} />
<main class="admin-main">
    {@render children()}
</main>
</div>
<style>
    .admin-root {
        display: flex;
        height: 100%;
        width: 100%;
    }
    .admin-main {
        width: calc(100%);
        background: #ffffff;
        height: 100%;
        overflow: auto;
    }
</style>