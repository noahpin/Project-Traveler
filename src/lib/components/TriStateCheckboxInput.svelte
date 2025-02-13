<script lang="ts">

	let { checkState = $bindable("false"), onChangeMain= (value)=>{} }: { checkState?: TriStateCheck, onChangeMain?: (v: boolean)=> void} = $props();
	let value = $state(false);
	$effect(() => {
		if (checkState == "true") {
			value = true;
		} else if (checkState == "false") {
			value = false;
		}
	});
	function checkChange() {
		if (value) {
			checkState = "true";
			onChangeMain(true);
		} else {
			checkState = "false";
			onChangeMain(false);
		}
	}
</script>
<div role="presentation" onclick={(e)=>e.stopPropagation()}>
<label class="admin-checkbox-wrapper" class:admin-checkbox-wrapper-indeterminate={checkState === "indeterminate"}>
	<input type="checkbox" onchange={checkChange} bind:checked={value} name="header-checkbox" />
	<div class="admin-checkbox-check">
		<i class="ti ti-check"></i>
	</div>
	<div class="admin-checkbox-indeterminate">
		<i class="ti ti-minus"></i>
	</div>
</label></div>