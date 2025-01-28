<script lang="ts">
	import { onMount } from "svelte";
    let {children} = $props();

    let cnv!: HTMLCanvasElement;
    let ctx!: CanvasRenderingContext2D;
    let w: number, h: number;
    let mX = Infinity, mY = Infinity;

    onMount(() => {
        ctx = cnv.getContext('2d')!;
        w = cnv.offsetWidth;
        h = cnv.offsetHeight;
        cnv.width = w;
        cnv.height = h;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        loop()
    });

    function loop() {
        ctx.fillStyle = '#ffffff10';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#4d00f3';
        ctx.beginPath();
        ctx.arc(mX, mY, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        requestAnimationFrame(loop);
    }

</script>
<svelte:window
on:pointermove={(e) => {
    mX = e.clientX;
    mY = e.clientY;
}}
    on:resize={() => {
        w = cnv.offsetWidth;
        h = cnv.offsetHeight;
        cnv.width = w;
        cnv.height = h;
    }}
/>

<div class="auth-ui-bg">
    <canvas bind:this={cnv}></canvas>
</div>
<div class="auth-form-container">
    {@render children()}
</div>

<style>
    .auth-ui-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .auth-ui-bg canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        filter: blur(50px);
        
    mask-image: radial-gradient(#000000 1px, #00000000 1px);
    mask-size: 16px 16px;
    }
</style>