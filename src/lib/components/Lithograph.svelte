<script lang="ts">
    import { Block, Lithograph } from "$lib/layout/lithograph";
	import { onMount } from "svelte";
    import { TextBlock } from "$lib/layout/blocks/textBlock";
    import { DividerBlock } from "$lib/layout/blocks/dividerBlock";
    import { ImageBlock } from "$lib/layout/blocks/imageBlock";
    import { ContainerBlock } from "$lib/layout/blocks/containerBlock";

    let {lithographData, hide}: {lithographData?: any | null, hide?: boolean} = $props();
    
    let holder: HTMLElement;
    let editor: Lithograph;
    onMount(() => {
        editor = new Lithograph({ 
            data: lithographData,
            container: holder,
            blockTypes: [TextBlock, DividerBlock, ImageBlock, ContainerBlock],
            enablePreview: false
         });
         
    });

    export function getJSON() {
        return editor.getJSON();
    }
</script>

<div class="container" class:lithograph-hidden={hide} bind:this={holder}>
</div>