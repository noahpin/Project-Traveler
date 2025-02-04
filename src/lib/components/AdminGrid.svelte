<script lang="ts">
	import { goto } from "$app/navigation";

	let {
		displayFields,
		posts,
	}: {
		displayFields: { key: string; label: string }[];
		posts: { [x: string]: any }[];
	} = $props();
</script>

{#snippet row(post: { [x: string]: any }, i: number)}
	<div
		role="button"
		tabindex="0"
		class="admin-grid-row"
		onclick={() => goto(`/admin/edit/${post.id}`)}
		onkeydown={() => goto(`/admin/edit/${post.id}`)}
		style:grid-row={`${i + 2} / ${i + 3}`}
	>
		<div class="admin-grid-cell" style:grid-column={`1 / 2`}>
			<input type="checkbox" />
		</div>
		{#each displayFields as field, i}
			<div
				class="admin-grid-cell"
				class:admin-grid-emphasis={field.key == "title"}
				style:grid-column={`${i + 2} / ${i + 3}`}
			>
				{#if field.key == "updated_at"}
					{new Date(post[field.key]).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				{:else if field.key == "status"}
					<span class={"admin-grid-status-" + post[field.key]}
						>{post[field.key]}</span
					>
				{:else if field.key == "slug"}
				<a href={field.key} target="_blank">
					<span style:font-family={"Geist Mono"}>
						/{post[field.key]}
					</span></a>
				{:else}{post[field.key]}
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

{#if posts != null}
	<div class="admin-grid">
		<div class="admin-grid-row admin-grid-header" style:grid-row={`1 / 2`}>
			<div class="admin-grid-cell" style:grid-column={`1 / 2`}>
				<input type="checkbox" />
			</div>
			{#each displayFields as field, i}
				<div class="admin-grid-cell" style:grid-column={`${i + 2} / ${i + 3}`}>
					{field.label}
				</div>
			{/each}
		</div>

		{#each posts as post, i}
			{@render row(post, i)}
		{/each}
	</div>
{:else}
	<div class="admin-grid-loader">
		<i class="ti ti-loader-2"></i>
	</div>
{/if}
