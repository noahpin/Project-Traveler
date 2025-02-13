<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { redirect } from "@sveltejs/kit";
	import DtLogo from "./DTLogo.svelte";
	let {supabase, closed}: {supabase: SupabaseClient, closed: boolean} = $props();


    function signOut() {
        supabase.auth.signOut();
        goto("/")
    }
</script>

<div class="admin-sidebar" class:admin-sidebar-closed={closed}>
	<div class="logo">
		<DtLogo></DtLogo>
	</div>
	<div class="gap"></div>
	<div class="button-wrapper">
		<a
			href="/admin"
			class="button-sidebar"
			class:button-sidebar-active={page.url.pathname === "/admin"}
		>
			<i class="ti ti-layout-dashboard"></i>
			<p>Dashboard</p>
		</a>
	</div>
	<div class="divider"></div>
	<div class="button-wrapper">
		<a
			href="/admin/pages"
			class="button-sidebar"
			class:button-sidebar-active={page.url.pathname === "/admin/pages"}
		>
			<i class="ti ti-app-window"></i>
			<p>Pages</p>
		</a>
	</div>
	<div class="button-wrapper">
		<a
			href="/admin/posts"
			class="button-sidebar"
			class:button-sidebar-active={page.url.pathname === "/admin/posts"}
		>
			<i class="ti ti-blockquote"></i>
			<p>Posts</p>
		</a>
	</div>
	<div class="button-wrapper">
		<a
			href="/admin/tags"
			class="button-sidebar"
			class:button-sidebar-active={page.url.pathname === "/admin/tags"}
		>
			<i class="ti ti-tags"></i>
			<p>Tags</p>
		</a>
	</div>
	<div class="button-wrapper">
		<a
			href="/admin/categories"
			class="button-sidebar"
			class:button-sidebar-active={page.url.pathname === "/admin/categories"}
		>
			<i class="ti ti-category"></i>
			<p>Categories</p>
		</a>
	</div>
	<div class="button-wrapper">
		<a
			href="/admin/authors"
			class="button-sidebar"
			class:button-sidebar-active={page.url.pathname === "/admin/authors"}
		>
			<i class="ti ti-writing-sign"></i>
			<p>Authors</p>
		</a>
	</div>
	<div class="button-wrapper">
		<button class="button-sidebar">
			<i class="ti ti-settings"></i>
			<p>Settings</p>
		</button>
	</div>
	<div class="divider"></div>
	<div class="button-wrapper">
		<button class="button-sidebar">
			<i class="ti ti-user-circle"></i>
			<p>Account</p>
		</button>
	</div>
	<div class="button-wrapper">
		<button class="button-sidebar" onclick={signOut}>
			<i class="ti ti-logout"></i>
			<p>Sign Out</p>
		</button>
	</div>
</div>

<style>
</style>
