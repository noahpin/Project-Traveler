<script lang="ts">
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	let monaco: typeof Monaco;
	import { onDestroy, onMount } from "svelte";

    let { value = $bindable(""), language}: {value: string, language: string} = $props();

	let monacoParent: HTMLElement;
	let monacoEditor: Monaco.editor.IStandaloneCodeEditor;
    
	onMount(async () => {
		monaco = (await import('$lib/monaco')).default;
		monacoEditor = monaco.editor.create(monacoParent, {
			lineNumbers: "off",
			minimap: {
				enabled: false,
			},
			showFoldingControls: 'never',
			scrollbar: {
				alwaysConsumeMouseWheel: true,
			},
		});
		const model = monaco.editor.createModel(
			value,
            language
		);
		monacoEditor.setModel(model);
		monacoEditor.onDidChangeModelContent(onMonacoModelChange);

	});
	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		monacoEditor?.dispose();
	});


	function onMonacoModelChange(event: Monaco.editor.IModelContentChangedEvent) {
		value = monacoEditor.getValue();
	}
</script>
<div class="admin-editor-monaco" bind:this={monacoParent}></div>