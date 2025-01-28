<script>
  import AuthUi from "$lib/components/AuthUI.svelte";
	let reset = false;
</script>
<AuthUi>
	{#if !reset}
		<h1>Login</h1>
		<form method="POST" action="?/login">
			<label>
				Email
				<input name="email" type="email" />
			</label>
			<label>
				Password
				<input name="password" type="password" />
			</label>
			<button type="submit"> Login </button>
		</form>
		<button class="button-secondary" on:click={() => (reset = true)}
			>Forgot Password? <u>Reset</u></button
		>
	{:else}
		<h1>Reset Password</h1>
		<form method="POST" action="?/resetPassword">
			<label>
				Email
				<input name="email" type="email" />
			</label>
			<button type="submit"> Reset Password </button>
		</form>
		<button class="button-secondary" on:click={() => (reset = true)}
			>Log In</button
		>
	{/if}
  </AuthUi>