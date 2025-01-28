<div class="admin-sidebar">
	<div class="logo">
		<i class="ti ti-horse"></i>
		<p>Traveler</p>
	</div>
	<div class="gap"></div>
	<button class="button-sidebar button-sidebar-active">
		<i class="ti ti-layout-dashboard"></i>
		<p>Dashboard</p>
	</button>
	<div class="divider"></div>
	<button class="button-sidebar">
		<i class="ti ti-app-window"></i>
		<p>Pages</p>
	</button>
	<button class="button-sidebar">
		<i class="ti ti-blockquote"></i>
		<p>Posts</p>
	</button>
	<button class="button-sidebar">
		<i class="ti ti-tags"></i>
		<p>Tags</p>
	</button>
	<button class="button-sidebar">
		<i class="ti ti-writing-sign"></i>
		<p>Authors</p>
	</button>
	<button class="button-sidebar">
		<i class="ti ti-settings"></i>
		<p>Settings</p>
	</button>
    <div class="divider"></div>
	<button class="button-sidebar">
		<i class="ti ti-user-circle"></i>
		<p>Account</p>
	</button>
</div>

<style>
	.admin-sidebar {
		width: 220px;
		height: 100%;
		background-color: #fff;
		box-sizing: border-box;
		border-right: 1px solid rgba(0, 0, 0, 0.094);
		flex-shrink: 0;

		display: flex;
		flex-direction: column;
        align-items: center;
		gap: 10px;
        padding: 20px;
	}

    .logo, .button-sidebar {
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 2px;
        width: 100%;
    }
    .logo *, .button-sidebar * {
        margin: 0;
        padding: 0;
    }
    .logo i, .button-sidebar i {
        font-size: 26px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

    }
    .logo p {
        font-size: 20px;
        font-weight: 600;
    }

    .button-sidebar p {
        font-size: 16px;
        height: fit-content;
    }

    .button-sidebar {
        border: none;
        background: transparent;
        cursor: pointer;
        transition: 0.2s;
        border-radius: 8px;
        font-family: "Geist Mono";
    }
    .button-sidebar-active, .button-sidebar:hover {
        background: var(--accent);
        color: white;
    }
    .gap {
        height: 20px;
    }
    .divider {
        height: 1px;
        width: 88%;
        background: rgba(0, 0, 0, 0.094);
    }
</style>
