import { Block, Lithograph, type BlockSaveData } from "../lithograph";

export class ContainerBlock extends Block {
    size: {numerator: number, denominator: number} = {numerator: 1, denominator: 1};
    static sizes: {numerator: number, denominator: number}[] = [
        {numerator: 1, denominator: 1},
        {numerator: 1, denominator: 2},
        {numerator: 1, denominator: 3},
        {numerator: 2, denominator: 3},
        {numerator: 1, denominator: 4},
        {numerator: 3, denominator: 4},
        {numerator: 1, denominator: 5},
        {numerator: 2, denominator: 5},
        {numerator: 3, denominator: 5},
        {numerator: 4, denominator: 5},
    ]
    sizePreview!: HTMLElement;
    constructor(editor: Lithograph, parent: Block | null) {
        super(editor, parent);
        this.title = "Container";
        this.icon = `<i class="ti ti-layout-columns"></i>`
        this.isContainerBlock = true;
    }

    static get blockType() {
        return "layout"
    }
    static get blockName() {
        return "container"
    }

    setData(data: any) {
        this.size = data.size;
        this.configure(this.size);
        data.children.forEach((childData: BlockSaveData) => {
            let block = this.editor.createBlockWithSaveData(this.editor.getBlockByNameString(childData.type)!, childData, {parent: this, insertBefore: null});
        });
    }

    static get blockConfigurations() {
        let arr = ContainerBlock.sizes.map((s) => {
            let name = `${s.numerator}/${s.denominator}`;
            return {
                name,
                configValue: s,
            }
        })
        return arr;
    }

    configure(size: {numerator: number, denominator: number}) {
        super.configure();
        this.size = size;
        this.container.style.setProperty("--numerator", this.size.numerator.toString());
        this.container.style.setProperty("--denominator", this.size.denominator.toString());
        this.nestingContainer!.style.setProperty("--numerator", this.size.numerator.toString());
        this.sizePreview.innerHTML = `${this.size.numerator}/${this.size.denominator}`;
        this.titleElement!.innerHTML = "Container";
    }


    renderTopbarButtons() {
        let leftChevron = document.createElement("button");
        leftChevron.innerHTML = `<i class="ti ti-chevron-left"></i>`;
        leftChevron.classList.add("led-top-bar-button");
        this.sizePreview = document.createElement("div");
        this.sizePreview.classList.add("led-container-size-preview");
        this.sizePreview.innerHTML = `${this.size.numerator}/${this.size.denominator}`;
        let rightChevron = document.createElement("button");
        rightChevron.innerHTML = `<i class="ti ti-chevron-right"></i>`;
        rightChevron.classList.add("led-top-bar-button");

        leftChevron.onclick = () => {
            this.incrementSize(true);
        }
        rightChevron.onclick = () => {
            this.incrementSize();
        }
        return [leftChevron, this.sizePreview, rightChevron];
    }

    incrementSize(decrement: boolean = false) {
        let index = ContainerBlock.sizes.findIndex((s) => s.numerator == this.size.numerator && s.denominator == this.size.denominator);
        index += decrement ? -1 : 1;
        if(index < 0 ) index+= ContainerBlock.sizes.length;
        if(index >= ContainerBlock.sizes.length) index-= ContainerBlock.sizes.length;
        this.size = ContainerBlock.sizes[index];
        this.sizePreview.innerHTML = `${this.size.numerator}/${this.size.denominator}`;
        this.container.style.setProperty("--numerator", this.size.numerator.toString());
        this.container.style.setProperty("--denominator", this.size.denominator.toString());
    }

    createBlock() {
        super.createBlock();

        this.container.classList.add("led-container-block");
        this.container.style.setProperty("--numerator", this.size.numerator.toString());
        this.container.style.setProperty("--denominator", this.size.denominator.toString());
        this.nestingContainer = document.createElement("div");
        this.nestingContainer.classList.add("led-container-block-preview");
        this.nestingContainer.classList.add("led-nesting-container");
        this.validFocusElements.push(this.nestingContainer)  
        this.contentContainer.appendChild(this.nestingContainer!);
    }
    render() {
        let content = "";
        this.childBlocks.forEach((child) => {
            content += child.render();
        });
        return `<div class="lpv-container" style="width: calc(${this.size.numerator}/${this.size.denominator} * 100%);">${content}</div>`;
    }
    save(): BlockSaveData {
        return {
            type: "container",
            data: {
                size: this.size,
                children: this.childBlocks.map((child) => child.save()),
            },
        }
    }
}