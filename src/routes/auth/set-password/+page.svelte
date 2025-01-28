<script>
  import AuthUi from "$lib/components/AuthUI.svelte";
</script>
<AuthUi>
<h1>Update password</h1>

<form method="POST" action="?/updatePassword">
    <label>
      New password
      <input name="password" type="password" />
    </label>
    <label>
      Confirm new password
      <input name="confirmPassword" type="password" />
    </label>
    <button>Update password</button>
  </form>
  </AuthUi>