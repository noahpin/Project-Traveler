<script lang="ts">
    import { Block, Lithograph } from "$lib/layout/lithograph";
	import { onMount } from "svelte";
    import { TextBlock } from "$lib/layout/blocks/textBlock";
    import { DividerBlock } from "$lib/layout/blocks/dividerBlock";
    import { ImageBlock } from "$lib/layout/blocks/imageBlock";
    import { ContainerBlock } from "$lib/layout/blocks/containerBlock";
    
    let holder: HTMLElement;
    let editor: Lithograph;
    onMount(() => {
        editor = new Lithograph({ 
            container: holder,
            blockTypes: [TextBlock, DividerBlock, ImageBlock, ContainerBlock]
         });
         
    });
</script>

<div class="container" bind:this={holder}>
</div>