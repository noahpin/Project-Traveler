import { Block, Lithograph, type BlockSaveData } from "../lithograph";

export type ImageBlockSaveData = {
	url: string;
}

export class ImageBlock extends Block {
	image: string = "https://placedog.net/400x200?r";
	previewElement!: HTMLImageElement;
	constructor(editor: Lithograph, parent: Block | null) {
		super(editor, parent);
		this.title = "Image";
        this.icon = `<i class="ti ti-photo"></i>`
	}

    static get blockType() {
        return "media"
    }
    static get blockName() {
        return "image"
    }

	setData(data: any) {
		this.image = data.url;
		this.previewElement.src = this.image;
	}

	createBlock() {
		super.createBlock();
		let d = document.createElement("div");
		d.classList.add("led-image-block-preview");
		this.previewElement = document.createElement("img");
		this.previewElement.src = this.image;
		d.appendChild(this.previewElement);
		this.contentContainer.appendChild(d);
	}
    render() {
		return `<div class="lpv-image"><img src="${this.image}" /></div>`;
    }

	save(): BlockSaveData<ImageBlockSaveData> {
		return {
			type: "image",
			id: this.id,
			data: {
				url: this.image,
			},
		}
	}
}