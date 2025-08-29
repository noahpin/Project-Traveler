<script lang="ts">
	import MediaLibraryInput from "$lib/components/MediaLibraryInput.svelte";

	let { data } = $props();

	let { session, supabase } = data;

    let image = $state("");
    let body = $state("");
    let articleUrl = $state("");

    async function sendNotification() {
        const { data, error } = await supabase.functions.invoke('breaking_notification', {
            body: JSON.stringify({ image, body, article_url: articleUrl })
        })

        if (error) {
            console.error(error);
        } else {
            console.log(data);
        }
    }
</script>

<div class="admin-page-header">
	<h1>Notifications</h1>
</div>
<div class="admin-editor-column">
	<h2>Send Breaking News Notification</h2>
	<div class="admin-editor-metadata-group">
		<div class="admin-editor-metadata-label">Body Text</div>
		<input type="text" class="admin-editor-input" bind:value={body} />
	</div>
	<div class="admin-editor-metadata-group">
		<div class="admin-editor-metadata-label">Article URL</div>
		<input type="url" class="admin-editor-input" bind:value={articleUrl} />
	</div>
	<div class="admin-editor-metadata-group">
        <MediaLibraryInput bind:image={image} {supabase} />
	</div>

	<div class="flex-hor">
		<button class="admin-button button-primary" onclick={sendNotification}>Send Notification</button>
	</div>
</div>

<style>
	.admin-editor-column {
		border: none;
	}
</style>
