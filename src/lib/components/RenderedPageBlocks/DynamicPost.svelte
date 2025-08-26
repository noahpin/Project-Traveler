<script lang="ts">
    import {getPostData} from "$lib/rendererUtil";
    let {blockData, postBlockData, blockId=""}: {
        blockData: any,
        postBlockData?: any[],
        blockId: string
    } = $props();
    let postData = $derived(getPostData(postBlockData!, blockId));
</script>
<div class="divider"></div>
dynamic post block
{#if postData}
{#each postData as post}
    <a class="post" href={`/${post.slug}`}>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <img src={post.featured_image} alt="">
    </a>
{/each}
{/if}