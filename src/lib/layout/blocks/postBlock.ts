import { Block, Lithograph, type BlockSaveData } from "../lithograph";

type PostBlockSaveData = {
    limit: number;
    offset: number;
    tags: string[];
    categories: string[];
    sortBy: 'date' | 'popularity'
    sortOrder: 'asc' | 'desc';
    includeSticky: boolean;

}

export class PostBlock extends Block {
    constructor(editor: Lithograph, parent: Block | null) {
        super(editor, parent);
        this.title = "Posts";
        this.icon = `<i class="ti ti-news"></i>`;
    }

    static get blockType() {
        return "content"
    }
    static get blockName() {
        return "post"
    }
    setData(data: any): void {
        
    }

    createBlock() {
        super.createBlock();
        let d = document.createElement("div");
        d.classList.add("led-post-block-preview");
        d.innerHTML = this.render();
        this.contentContainer.appendChild(d);
    }
    render() {
        return `yooooo dummy post`;
    }
    save(): BlockSaveData<PostBlockSaveData> {
        return {
            type: "post",
            id: this.id,
            data: {
                limit: 10,
                offset: 0,
                tags: [],
                categories: [],
                sortBy: 'date',
                sortOrder: 'desc',
                includeSticky: false,
            },
        }
    }
}
