<script lang="ts">
	import { onMount } from "svelte";
	let { children } = $props();
	import {Spring} from "svelte/motion";

	let velocity = new Spring(0, {
		stiffness: .06,
		damping: 1
	});

	let mX = $state(Infinity),
		mY = $state(Infinity);
</script>

<svelte:window
	on:pointermove={(e) => {
		velocity.set(Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)));
		mX = e.clientX;
		mY = e.clientY;
	}}
/>

<div class="auth-ui-bg">
</div>
<div class="auth-ui-bg-2">
</div>
<div class="auth-ui-bg-3">
</div>
<div class="auth-ui-bg-4">
	<div class="blur-glow-b" style:left={mX + "px"} style:top={mY + "px"}> </div>
	<div class="blur-glow" style:left={mX + "px"} style:top={mY + "px"}> </div>
</div>
<div class="auth-form-container">
	{@render children()}
</div>

<style>
	.auth-ui-bg , .auth-ui-bg-2, .auth-ui-bg-3, .auth-ui-bg-4 {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		mask-image: radial-gradient(#000000 1px, #00000000 1px);
		filter: grayscale(1) brightness(2);
		opacity: 0.2;
		mask-size: 16px 16px;
		background-image: url("data:image/png;base64,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");
		mask-position: center;
		animation: 5s move infinite linear;
		background-size: 200px 200px;
	}

	.auth-ui-bg-2 {
		background-size: 400px 200px;
		animation: 5s move-x infinite linear;

	}
	.auth-ui-bg-3 {
		background: black;
		opacity: .1;
	}
	.auth-ui-bg-4 {
		background: transparent;
		opacity: 1;
		filter: none;
	}
	.blur-glow, .blur-glow-b {
		position: absolute;
		width: 100px;
		height: 100px;
		background: red;
		border-radius: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%) scale(2);
		filter: blur(20px);
	}
	.blur-glow-b {
		background: white;
		width: 180px;
		height: 180px;
		filter: blur(20px);
	}

	@keyframes move {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 0 200px;
		}
	}
	@keyframes move-x {
		from {
			background-position: 400px 0;
		}
		to {
			background-position: 0 0;
		}
	}
</style>
