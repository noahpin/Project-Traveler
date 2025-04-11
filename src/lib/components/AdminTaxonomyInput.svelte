<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { createPopper, type VirtualElement } from "@popperjs/core";
	import { onMount, mount, type Component, unmount } from "svelte";
    import AdminTaxonomyPopover from "./AdminTaxonomyPopover.svelte";

    let { taxonomies = $bindable([]), supabase, table = "" }: {taxonomies: {name: string, id: string}[], supabase: SupabaseClient, table: string} = $props();
    let chipInputEl: Element;

    let taxonomyComponent: any;
    function open() {
        if(taxonomyComponent) {
            unmountPopover();
        }
        taxonomyComponent = mount(AdminTaxonomyPopover,{
            target: document.body,
            props: {
                unmountFn: unmountPopover,
                taxonomies,
                supabase,
                table,
                parentElement: chipInputEl,
                taxonomiesUpdated: onTaxonomyUpdated
            },
        });
    }
    function unmountPopover() {
        if(taxonomyComponent) {
            unmount(taxonomyComponent);
        }
    }

    function onTaxonomyUpdated(t: {name: string, id: string}[]) {
        taxonomies = t;
    }
</script>

<div role="button" tabindex="-1" bind:this={chipInputEl} onclick={open} onkeypress={open} class="admin-editor-input admin-editor-chip-input">
    {#each taxonomies as taxonomy}
        <div class="admin-chip">
            {taxonomy.name}
        </div>
    {/each}
</div>
