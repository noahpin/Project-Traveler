<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
	import StarterKit from '@tiptap/starter-kit';
    import { Markdown } from "tiptap-markdown";

    let editorContainer: HTMLDivElement;
    let editor: Editor;

    onMount(()=> {
        editor = new Editor({
			element: editorContainer,
			extensions: [StarterKit],
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
		});
    })

    function logData() {
        console.log(editor.getJSON());
    }
</script>
<button on:click={logData}>log md</button>
<div bind:this={editorContainer} class="editor"></div>

<style>
    .editor {
        border: 1px solid #ccc;
        padding: 0;
    }
</style>