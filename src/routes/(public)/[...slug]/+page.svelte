<script>
	let { data } = $props();
	let { page } = $derived(data);
</script>

<h1>Welcome to Supabase!</h1>
{#if data.error}
    {JSON.stringify(data.error)}
{/if}
<ul>
	{JSON.stringify(page)}
</ul>

<a href="/asdf">asdf</a>
