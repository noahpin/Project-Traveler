<script lang="ts">
    let { page = $bindable(1), pageCount = 1, onChange = (x)=>{} }: {page: number,pageCount: number, onChange: (page: number) => void} = $props();
    function validatePage() {
        if (page < 1) {
            page = 1;
        } else if (page > pageCount) {
            page = pageCount;
        }
    }

    function pageUpdate() {
        validatePage();
        onChange(page);
    }
</script>

<button disabled={page == 1} aria-label="left" class="admin-button button-icon button-sub" onclick={() => {page = 1; pageUpdate();}}>
    <i class="ti ti-chevrons-left"></i>
</button>
<button disabled={page == 1} aria-label="left" class="admin-button button-icon button-sub" onclick={() => {page--; pageUpdate();}}>
    <i class="ti ti-chevron-left"></i>
</button>
<p>{page} of {Math.max(pageCount, 1)}</p>
<button disabled={page == pageCount} aria-label="right" class="admin-button  button-icon button-sub" onclick={() =>{ page++;pageUpdate();}}>
    <i class="ti ti-chevron-right"></i>
</button>
<button disabled={page == pageCount} aria-label="right" class="admin-button  button-icon button-sub" onclick={() =>{ page = pageCount;pageUpdate();}}>
    <i class="ti ti-chevrons-right"></i>
</button>

<style>
    p {
        font-family: "Geist Mono";
    }
</style>