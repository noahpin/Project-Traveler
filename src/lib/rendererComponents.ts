import type { Component } from "svelte";
import Container from "$lib/components/RenderedPageBlocks/Container.svelte";
import Divider from "$lib/components/RenderedPageBlocks/Divider.svelte";
import Image from "$lib/components/RenderedPageBlocks/Image.svelte";
import Text from "$lib/components/RenderedPageBlocks/Text.svelte";

export let componentMap: {
    [key: string]: Component<{blockData: any}>;
} = {
    container: Container,
    divider: Divider,
    image: Image,
    text: Text
};