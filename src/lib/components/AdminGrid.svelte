<script lang="ts">
	import { goto } from "$app/navigation";
	import type { Snippet } from "svelte";
	import CheckboxInput from "$lib/components/CheckboxInput.svelte";
	import NullMarker from "./NullMarker.svelte";
	import TriStateCheckboxInput from "./TriStateCheckboxInput.svelte";
	let {
		displayFields,
		data,
		editURL,
		columnWidths,
		callback,
		maxPageSize = 50,
		selectedRows = $bindable(new Array(maxPageSize).fill(false))
	}: {
		displayFields: { key?: string; label: string; renderer?: Snippet<[any]> }[];
		data: { [x: string]: any }[];
		editURL?: string;
		columnWidths?: string;
		callback?: (data: any) => void;
		maxPageSize?: number;
		selectedRows?: boolean[];
	} = $props();
	callback = callback ?? ((data) => {
		goto(`${editURL}${data.id}`);
	});

	let mainCheckState: TriStateCheck = $state("indeterminate");
	let recentlyClickedIndex = -1;
	function onRowSelectChange(e: PointerEvent | KeyboardEvent, value: boolean, index: number) {
		if(e.shiftKey && recentlyClickedIndex != -1) {
			let start = Math.min(recentlyClickedIndex, index);
			let end = Math.max(recentlyClickedIndex, index);
			for(let i = start; i <= end - 1; i++) {
				selectedRows[i] = value;
			}
		}
		selectedRows[index] = !value;
		recentlyClickedIndex = index;
	}
	$effect(() => {
		if (selectedRows.filter(Boolean).length >= data?.length && data?.length != 0) {
			mainCheckState = "true";
		} else if (selectedRows.every((v) => !v)) {
			mainCheckState = "false";
		} else {
			mainCheckState = "indeterminate";
		}
	});
	function onMainCheckChange(value: boolean) {
		if(value) {
			for(let i = 0; i < data?.length; i++) {
				selectedRows[i] = true;
			}
		} else {
			selectedRows = selectedRows.map(() => false);
		}
	}
</script>

{#snippet row(data: { [x: string]: any }, i: number)}
	<div
		role="button"
		tabindex="0"
		class="admin-grid-row"
		onclick={() => callback && callback(data)}
		onkeydown={() => callback && callback(data)}
		style:grid-row={`${i + 2} / ${i + 3}`}
	>
		<div class="admin-grid-cell" style:grid-column={`1 / 2`}>
			<CheckboxInput bind:value={selectedRows[i]} click={(e, value)=>onRowSelectChange(e, value, i)} />
		</div>
		{#each displayFields as field, i}
			<div
				class="admin-grid-cell"
				class:admin-grid-emphasis={field.key == "title" || field.key == "name"}
				style:grid-column={`${i + 2} / ${i + 3}`}
			>
				{#if field.key}
					{#if field.key == "updated_at"}
						{new Date(data[field.key]).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
						
					{:else if field.key == "published_at"}
						{new Date(data[field.key]).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					{:else if field.key == "status"}
						<span class={"admin-grid-status-" + data[field.key]}
							>{data[field.key]}</span
						>
					{:else if field.key == "slug"}
						<span style:font-family={"Geist Mono"}>
							/{data[field.key]}
						</span>
					{:else if data[field.key] == null || data[field.key].length == 0}
							<NullMarker></NullMarker>
					{:else}
						{data[field.key]}
					{/if}
				{/if}
				{#if field.renderer}
					{@render field.renderer(data)}
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

{#if data != null}
	<div class="admin-grid" style:grid-template-columns={columnWidths}>
		<div class="admin-grid-row admin-grid-header" style:grid-row={`1 / 2`}>
			<div class="admin-grid-cell" style:grid-column={`1 / 2`}>
				<TriStateCheckboxInput onChangeMain={onMainCheckChange} bind:checkState={mainCheckState} />
			</div>
			{#each displayFields as field, i}
				<div class="admin-grid-cell" style:grid-column={`${i + 2} / ${i + 3}`}>
					{field.label}
				</div>
			{/each}
		</div>

		{#each data as piece, i}
			{@render row(piece, i)}
		{/each}
	</div>
{:else}
	<div class="admin-grid-loader">
		<i class="ti ti-loader-2"></i>
	</div>
{/if}
