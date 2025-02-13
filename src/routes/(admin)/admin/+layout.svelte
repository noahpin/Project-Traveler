<script>
    import AdminSidebar from "$lib/components/AdminSidebar.svelte";
    let { children, data } = $props();
    import  {page} from "$app/state"
    let { supabase } = $derived(data);
    let closed = $derived(page.url.toString().includes("edit/"));
</script>

<div class="admin-root">

<AdminSidebar {closed} {supabase} />
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
        height: 100%;
        overflow: auto;
    }
</style>