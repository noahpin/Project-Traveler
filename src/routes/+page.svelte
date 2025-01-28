<script>
	let { data } = $props();
	let { countries } = $derived(data);
</script>

<h1>Welcome to Supabase!</h1>
{#if data.error}
    {JSON.stringify(data.error)}
{/if}
<ul>
	{#each countries as country}
		<li>{country.name}</li>
	{/each}
</ul>
