import Blockquote from "@tiptap/extension-blockquote";
import { BulletList } from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Heading } from "@tiptap/extension-heading";
import { ListItem } from "@tiptap/extension-list-item";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import Typography from "@tiptap/extension-typography";
import History from "@tiptap/extension-history";

import Placeholder from "@tiptap/extension-placeholder";

import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { Editor } from "@tiptap/core";
import { Block, type Lithograph, type BlockSaveData } from "../lithograph";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import { NodeSelection } from "@tiptap/pm/state";
import { computePosition, offset } from "@floating-ui/core";
import { platform } from "@floating-ui/dom";

export class TextBlock extends Block {
	textEditor!: Editor;
    editorContainer!: HTMLElement;
    closeButton!: HTMLElement;
    styleBar!: HTMLElement;
    rect!: DOMRect;
    linkTooltip?: HTMLElement;
    tiptapLinkBubbleMenu!: HTMLElement;
    static fonts = [
        "Inter",
        "Geist",
        "Geist Mono",
        "Source Serif 4",
    ];
    tiptapLinkBubbleMenuURL!: HTMLInputElement;
	constructor(editor: Lithograph, parent: Block | null) {
		super(editor, parent);
		this.title = "Text";
        this.icon = `<i class="ti ti-align-justified"></i>`
	}

    static get blockType() {
        return "content"
    }

    static get blockName() {
        return "text"
    }

	setData(data: any) {
        this.textEditor.commands.setContent(data.content);

    }

    renderTopbarButtons() {
        let button = document.createElement("button");
        button.innerHTML = `<i class="ti ti-arrows-maximize"></i>`;
        button.classList.add("led-top-bar-button");
        button.onclick = () => {
            this.expandTextEditor();
        }
        return [button];
    }

    expandTextEditor() {
        this.rect = this.editorContainer.getBoundingClientRect();
        let cRect = this.contentContainer.getBoundingClientRect();
        this.contentContainer.style.width = cRect.width + "px";
        this.contentContainer.style.height = cRect.height + "px";
        this.editorContainer.style.width = this.rect.width + "px";
        this.editorContainer.style.height = this.rect.height + "px";
        this.editorContainer.style.top = this.rect.top + "px";
        this.editorContainer.style.left = this.rect.left + "px";
        this.editorContainer.classList.add("led-text-block-preview-expanded");
        this.closeButton.classList.add('show');
        this.styleBar.classList.add('show');

        this.editor.createModal(this.editorContainer);


        setTimeout(() => {
            this.editorContainer.style.width ="";
            this.editorContainer.style.height ="";
            this.editorContainer.style.top ="50px";
            this.editorContainer.style.left ="50px";
            
        }, 1);

        this.tiptapLinkBubbleMenu.classList.add("led-tooltip-hidden");
    }

    closeTextEditor() {
        this.editor.closeModal();
        this.editorContainer.style.width = this.rect.width + "px";
        this.editorContainer.style.height = this.rect.height + "px";
        this.editorContainer.style.top = this.rect.top + "px";
        this.editorContainer.style.left = this.rect.left + "px";

        this.closeButton.classList.remove('show');
        this.styleBar.classList.remove('show');
        setTimeout(() => {
            this.editorContainer.classList.remove("led-text-block-preview-expanded");
            this.contentContainer.appendChild(this.editorContainer);
            this.editorContainer.style.width ="";
            this.editorContainer.style.height ="";
            this.editorContainer.style.top ="";
            this.editorContainer.style.left ="";
            this.contentContainer.style.width = "";
            this.contentContainer.style.height = "";
        }, 380);

        this.tiptapLinkBubbleMenu.classList.add("led-tooltip-hidden");
    }

    createTextStyleBar() {
        let toolbar = document.createElement("div");
        toolbar.classList.add("led-text-style-toolbar");
        let icons = [
            { icon: "ti-bold", callback: () => this.textEditor.chain().focus().toggleBold().run(), extension: Bold },
            { icon: "ti-italic", callback: () => this.textEditor.chain().focus().toggleItalic().run(), extension: Italic },
            { icon: "ti-strikethrough", callback: () => this.textEditor.chain().focus().toggleStrike().run(), extension: Strike },
            { icon: "ti-underline", callback: () => this.textEditor.chain().focus().toggleUnderline().run(), extension: Underline },
            { icon: "ti-highlight", callback: () => this.textEditor.chain().focus().toggleHighlight().run(), extension: Highlight },
            { icon: "ti-link", callback: (buttonEl: HTMLElement) => this.createLink(buttonEl), extension: Link },
        ];
        //create fonts dropdown
        let fontDropdown = document.createElement("select");
        TextBlock.fonts.forEach((font) => {
            let option = document.createElement("option");
            option.innerHTML = font;
            option.value = font;
            fontDropdown.appendChild(option);
        });
        fontDropdown.classList.add("led-text-style-dropdown");
        fontDropdown.onchange = (e) => {
            this.textEditor.chain().focus().setFontFamily(`'${(e.target! as HTMLInputElement).value}'`).run();
        }
        toolbar.appendChild(fontDropdown);

        icons.forEach((i) => {
            let button = document.createElement("button");
            button.classList.add("led-text-style-button");
            button.innerHTML = `<i class="ti ${i.icon}"></i>`;
            button.onclick = () => {
                i.callback(button);
                button.blur();
            };
            toolbar.appendChild(button);
        });
        return toolbar;
    }

    createLinkEditUI(deleteButton: boolean = false): HTMLElement[] {
        let url = document.createElement("input");
        url.placeholder = "Enter URL";
        url.classList.add("led-tooltip-input");
        let completeButton = document.createElement("button");
        completeButton.innerHTML = `<i class="ti ti-check"></i>`;
        completeButton.classList.add("led-tooltip-button");
        completeButton.onclick = (() => {
            this.textEditor.chain().focus().extendMarkRange('link').setLink({ href: url.value }).run();
            this.editor.closeTooltip(this.linkTooltip!);
        }).bind(this);
        if(deleteButton) {
            let deleteButton = document.createElement("button");
            deleteButton.innerHTML = `<i class="ti ti-trash"></i>`;
            deleteButton.classList.add("led-tooltip-button");
            deleteButton.onclick = (() => {
                this.textEditor.chain().focus().unsetLink().run();
                this.editor.closeTooltip(this.linkTooltip!);
            }).bind(this);
            return [url, completeButton, deleteButton];
        }

        return [url, completeButton];

    }

    createLink(button: HTMLElement) {
        this.linkTooltip = this.editor.createTooltip(button, this.createLinkEditUI());
    }

	createBlock() {
		super.createBlock();
		this.editorContainer = document.createElement("div");
		this.editorContainer.classList.add("led-text-block-preview");
		this.contentContainer.appendChild(this.editorContainer);
        this.tiptapLinkBubbleMenu = document.createElement("div");
        this.tiptapLinkBubbleMenu.classList.add("led-tooltip");
        this.tiptapLinkBubbleMenu.classList.add("led-tooltip-hidden");
        let ui = this.createLinkEditUI(true);
        this.tiptapLinkBubbleMenuURL = ui[0] as HTMLInputElement;
        ui.forEach((el) => {
            this.tiptapLinkBubbleMenu.appendChild(el);
        })
        this.editor.container.appendChild(this.tiptapLinkBubbleMenu);
        console.log(this.tiptapLinkBubbleMenu)
		this.textEditor = new Editor({
			element: this.editorContainer,
			extensions: [
				Blockquote,
				BulletList,
				Document,
				HardBreak,
				Heading,
				ListItem,
				OrderedList,
				Paragraph,
				Text,
				Bold,
				Italic,
				Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                        target: null
                    }
                }),
				Strike,
                Typography,
                History,
                Highlight,
                Underline,
                Color,
                FontFamily,
                TextStyle,
                TextAlign.configure({
                    types: ["paragraph", "heading"],
                }),
				Placeholder.configure({
					placeholder: "Click to start typing!",
				}),
			],
            onFocus: () => {
                this.focus(null, true);
            },
            onBlur: () => {
                this.tiptapLinkBubbleMenu.classList.remove("led-tooltip-hidden");

            },
            onUpdate: this.tiptapUpdated.bind(this),
            onSelectionUpdate: this.tiptapSelectionUpdated.bind(this),
		}); 

        this.closeButton = document.createElement("button");
        this.closeButton.innerHTML = `<i class="ti ti-x"></i>`;
        this.closeButton.classList.add("led-text-block-close");
        this.closeButton.onclick = () => {
            this.closeTextEditor();
        }
        this.editorContainer.appendChild(this.closeButton);
        this.styleBar = this.createTextStyleBar();
        this.editorContainer.appendChild(this.styleBar);

        this.validFocusElements.push(this.editorContainer)
	}
    tiptapUpdated() {
        console.log("Tiptap updated");
        this.tiptapLinkBubbleMenu.classList.add("led-tooltip-hidden");
    }
    tiptapSelectionUpdated(props: {editor: Editor}) {
        let editor = props.editor;
        if (editor.isActive("link") && editor.isFocused) {
            let ranges = editor.state.selection.ranges;
            // console.log(editor.state.selection)
            let view = editor.view;
            const from = Math.min(...ranges.map(range => range.$from.pos))
            const to = Math.max(...ranges.map(range => range.$to.pos))
            //get selected node
            let node = view.nodeDOM(from) as HTMLElement;
            let nodePos = editor.$pos(from);
            let nodeEl = editor.$pos(nodePos.from).element;
            //get url of current selection
            let link = editor.getAttributes('link').href
            this.tiptapLinkBubbleMenuURL.value = link;
            computePosition(nodeEl, this.tiptapLinkBubbleMenu,{platform: platform, placement: "top-start", middleware: [offset(6)]}).then(
                ({x, y}) => {
                    Object.assign(this.tiptapLinkBubbleMenu.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    });
                    console.log(this.tiptapLinkBubbleMenu)
                }
            )
            this.tiptapLinkBubbleMenu.classList.remove("led-tooltip-hidden");
        } else {
            this.tiptapLinkBubbleMenu.classList.add("led-tooltip-hidden");
            
        }
    }
    render() {
        return `<div class="lpv-text">${this.textEditor.getHTML()}</div>`;
    }
    save(): BlockSaveData {
        return {
            type: "text",
            data: {
                content: this.textEditor.getHTML(),
            },
        }
    }
}