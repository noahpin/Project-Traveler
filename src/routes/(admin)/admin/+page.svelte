<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';

	let {data} = $props();

	let { session, supabase, profile, error } = data
	
	let loading = $state(false)
	const handleSignOut: SubmitFunction = () => {
		loading = true
		return async ({ update }) => {
			loading = false
			update()
		}
	}
</script>

<h1> dashboard</h1>

<form method="post" action="?/signout" use:enhance={handleSignOut}>
	<div>
		<button class="button block" disabled={loading}>Sign Out</button>
	</div>
</form>