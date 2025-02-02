<script lang="ts">
    import "$lib/layoutEditor.css"
    import Lithograph from "$lib/components/Lithograph.svelte";
    let {data} = $props();
    let {page, supabase} = $derived(data);
    let lithograph;

    async function updateData() {
        let data = lithograph!.getJSON();
        let content = {
            ...page.content
        }
        content.content = data;
        console.log(page)
        console.log(data)
        let {data: dat, error} = await supabase.from('posts').update({content: content}).eq('id', page.id);
        console.log(dat, error)
    }
</script>

<div class="admin-page-content">
	<div class="admin-page-header">
		<h1>Edit {page.post_type}</h1>
        <div class="admin-page-header-buttons">
            <button onclick={updateData} class="admin-page-header-button button-green">
                Update
            </button>
        </div>
	</div>
    <div class="admin-editor">
<Lithograph bind:this={lithograph} lithographData={page.content} /></div>
</div>
