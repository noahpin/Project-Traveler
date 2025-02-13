<script lang="ts">
	let { data } = $props();
	let { tag: originalTagData, supabase } = $derived(data);
	let tag = $derived(originalTagData);
</script>

<div class="admin-page-content">
	<div class="admin-page-header">
		<div class="admin-buttons">
			<h1>Edit Tag</h1>
		</div>
		<div class="admin-buttons"></div>
	</div>
	<div class="admin-editor-column">
		<div class="admin-editor-metadata-group">
			<div class="admin-editor-metadata-label">Title</div>
			<input
				type="text"
				bind:value={tag.name}
				class="admin-editor-input"
			/>
		</div>
		<div class="admin-editor-metadata-group">
			<div class="admin-editor-metadata-label">Slug</div>
			<div class="admin-editor-metadata-slug">
				/
				<input
					class="admin-editor-input"
					type="text"
					bind:value={tag.slug}
				/>
			</div>
		</div>
		<div class="admin-editor-metadata-group">
			<div class="admin-editor-metadata-label">Description</div>
			<div class="admin-editor-metadata-slug">
				<textarea
					class="admin-editor-metadata-textarea"
					bind:value={tag.self_slug}
				></textarea>
			</div>
		</div>
        <div class="flex-hor">
            <button class="admin-button button-primary">Update</button>
            <button class="admin-button button-delete">Delete</button>
        </div>
	</div>
</div>

<style>
	.admin-editor-column {
		padding: 20px;
		width: 100%;
		box-sizing: border-box;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
</style>
