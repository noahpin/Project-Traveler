<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { createPopper, type VirtualElement } from "@popperjs/core";
	import { onMount, unmount } from "svelte";

	let {
		taxonomies = $bindable([]),
		supabase,
		table = "",
		parentElement,
        unmountFn,
        taxonomiesUpdated,
	}: {
		taxonomies: { name: string; id: string }[];
		supabase: SupabaseClient;
		table: string;
		parentElement: Element;
        unmountFn: () => void;
        taxonomiesUpdated: ((taxonomies: { name: string; id: string }[]) => void);
	} = $props();
	let popoverEl: HTMLElement;
	let searchDebounce: string | number | NodeJS.Timeout | undefined;
	let searchQuery = $state("");
	let searchResults: any[] = $state([]);
	function onSearchUpdate() {
		if (searchDebounce) {
			clearTimeout(searchDebounce);
		}
		searchDebounce = setTimeout(() => {
            searchResults = [];
            page = 0;
			search();
		}, 500);
	}
    let page = 0;
	async function search() {
        loading = true;

        let query = supabase
            .from(table)
            .select("*")
            .ilike("name", `%${searchQuery}%`)
            .range(page * 100, (page + 1) * 100 - 1);
        let {data, error} = await query;
        if(error || !data) {
            console.error(error);
            return;
        }
        searchResults.push(...data);
        loading = false;
	}
    onMount(() => {
        createPopper(parentElement, popoverEl, {
            placement: "auto-start",

			modifiers: [
				{
					name: "offset",
					options: {
						offset: [0, 8],
					},
				},
				{
					name: "preventOverflow",
					options: {
						padding: 8,
					},
				},
			],
        });
        search();
    })
    function scroll(e: UIEvent) {
        //infinite scrolling
        if(!e.target) return;
        if((e.target as HTMLElement).scrollTop + (e.target as HTMLElement).clientHeight >= (e.target as HTMLElement).scrollHeight) {
            page++;
            search();
        }

    }
    let loading = $state(true)

    let onclick = (e: MouseEvent) => {
        if(!popoverEl) return;
        if(!popoverEl.contains(e.target as Node) && !parentElement.contains(e.target as Node)) {
            unmountFn();
        }
    }

    function removeTaxonomy(taxonomy: any) {
        setTimeout(() => {
            taxonomies = taxonomies.filter((t) => t.id != taxonomy.id);
            taxonomiesUpdated(taxonomies);            
        }, 0);
    }

    function addTaxonomy(taxonomy: any) {
        setTimeout(() => {
            taxonomies.push(taxonomy);
            taxonomiesUpdated(taxonomies);            
        }, 0);
    }
    function toggleTaxonomy(taxonomy: any) {
        if(taxonomies.find((t) => t.id == taxonomy.id)) {
            removeTaxonomy(taxonomy);
        } else {
            addTaxonomy(taxonomy);
        }
    }
</script>
<svelte:window onclick={onclick}></svelte:window>
<div bind:this={popoverEl} class="admin-editor-popover admin-editor-popover-show">
	<div class="admin-editor-chip-flex">
        {#each taxonomies as taxonomy}
            <button class="admin-chip" onclick={()=> removeTaxonomy(taxonomy)}>{taxonomy.name}</button>
        {/each}
    </div>
	<input
		class="admin-editor-input"
		type="text"
		placeholder="Search..."
		bind:value={searchQuery}
		oninput={onSearchUpdate}
	/>
	<div class="admin-editor-chip-results" onscroll={scroll}>
        {#each searchResults as result}
            <button onclick={()=> {
                toggleTaxonomy(result);
            }} class="admin-result-row" class:admin-result-row-chosen={taxonomies.find((t) => t.id == result.id)}>
                {result.name}
            </button>
        {/each}
		{#if loading}
            <div class="admin-grid-loader">
                <i class="ti ti-loader-2"></i>
            </div>
        {/if}
    </div>
</div>

<style>
    .admin-editor-chip-flex {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        border: 1px solid rgba(0,0,0,.1);
        border-radius: 8px;
        padding: 4px;
        box-sizing: border-box;
        min-height: 35px;
    }
	.admin-editor-input {
		width: 100%;
	}
    .admin-editor-chip-results {
        max-height: 300px;
        overflow-y: auto;
        min-height: 100px;
        border: 1px solid rgba(0,0,0,.1);
        border-radius: 8px;
        padding-bottom: 20px;
    }
    .admin-result-row {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
        border:none;
        border-bottom:  1px solid rgba(0,0,0,.1);
        cursor: pointer;
        text-align: left;
        background: white;
        font-size: 16px;

    }
    .admin-result-row-chosen {
        background: #0080ff1e;
    }
    .admin-result-row:hover {
        background: rgba(0,0,0,.05);
    }
    .admin-result-row-chosen:hover {
        background: #0080ff39;
    }
    .admin-chip {
        border:none;
        position:relative;
        overflow: hidden;
    }

    .admin-chip:hover {
        background: var(--cardinal);
        color: white;
    }
</style>
