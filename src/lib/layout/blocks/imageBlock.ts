import { Block, Lithograph, type BlockSaveData } from "../lithograph";

export class ImageBlock extends Block {
	image: string = "https://placecats.com/300/200";
	constructor(editor: Lithograph, parent: Block | null) {
		super(editor, parent);
		this.title = "Image";
        this.icon = `<i class="ti ti-photo"></i>`
	}

    static get blockType() {
        return "media"
    }

	createBlock() {
		super.createBlock();
		let d = document.createElement("div");
		d.classList.add("led-image-block-preview");
		let i = document.createElement("img");
		i.src = this.image;
		d.appendChild(i);
		this.contentContainer.appendChild(d);
	}
    render() {
		return `<div class="lpv-image"><img src="${this.image}" /></div>`;
    }

	save(): BlockSaveData {
		return {
			type: "image",
			data: {
				url: this.image,
			},
		}
	}
}