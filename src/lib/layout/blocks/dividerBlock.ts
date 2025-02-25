import { Block, Lithograph, type BlockSaveData } from "../lithograph";

export class DividerBlock extends Block {
	constructor(editor: Lithograph, parent: Block | null) {
		super(editor, parent);
		this.title = "Divider";
        this.icon = `<i class="ti ti-separator"></i>`
	}

    static get blockType() {
        return "content"
    }
    static get blockName() {
        return "divider"
    }
	setData(data: any): void {
		
	}

	createBlock() {
		super.createBlock();
		let d = document.createElement("div");
		d.classList.add("led-divider-block-preview");
		this.contentContainer.appendChild(d);
	}
    render() {
        return `<div class="lpv-divider"><div class="lpv-divider-bar"></div></div>`;
    }
	save(): BlockSaveData {
		return {
			type: "divider",
			data: {},
		}
	}
}
