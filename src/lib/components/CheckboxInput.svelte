<script lang="ts">
	let { value = $bindable(false), click = (e, value) =>{} }: { value?: boolean, click?: (e: PointerEvent | KeyboardEvent, value: boolean)=>void} = $props();
</script>
<div role="presentation" onclick={(e)=>e.stopPropagation()} onpointerup={(e)=> {e.stopPropagation(); click(e,!value)}} onkeydown={(e)=>{ e.stopPropagation(); click(e, !value)}}>
<label class="admin-checkbox-wrapper" >
	<input type="checkbox" bind:checked={value} name="row-checkbox" />
	<div class="admin-checkbox-check">
		<i class="ti ti-check"></i>
	</div>
</label></div>