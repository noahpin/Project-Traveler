import EditorJS from "@editorjs/editorjs";

export class Layout {
	el!: HTMLElement;
	data: any;
	elements: any[];
	api: any;
    block: any;
    settings: { name: string; icon: string; callback: any; }[];
	static get toolbox() {
		return {
			title: "Layout",
			icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
		};
	}
	constructor({ data, api, block }: any) {
		this.data = data;
		this.api = api;
        this.block = block;
		this.elements = [];
        this.settings = [
			// {
			// 	name: "Toggle Full Width",
			// 	icon: `<i class="ti ti-arrows-horizontal"></i>`,
            //     callback: null,
			// },
		];
	}

	render() {
		this.el = document.createElement("div");
		this.el.classList.add("ejs-layout-block");
		this._createEditorChild(0);
		this._createEditorChild(0);
		this._createDividerChild(1);
		return this.el;
	}

	renderSettings() {
		const wrapper = document.createElement("div");

		this.settings.forEach((tune) => {
			let button = document.createElement("div");

			button.classList.add("ce-popover-item");
			wrapper.appendChild(button);

            let icon = document.createElement("div");
            icon.innerHTML = tune.icon;
            icon.classList.add("ce-popover-item__icon");
            icon.classList.add("ce-popover-item__icon--tool");
            button.appendChild(icon);
            let title = document.createElement("div");
            title.innerHTML = tune.name;
            title.classList.add("ce-popover-item__title");
            button.appendChild(title);

            button.addEventListener("click", tune.callback.bind(this));
		});

		return wrapper;
	}


	_createEditorChild(index: number) {
		let firstChild = this.el.childNodes.length == 0;
		let child = document.createElement("div");
		child.classList.add("ejs-layout-editor-child");
		const editor = new EditorJS({
			holder: child,
		});
		if (2 * index + 1 > this.el.childNodes.length - 1) {
			this.el.appendChild(child);
		} else {
			this.el.insertBefore(child, this.el.childNodes[2 * index + 1]);
		}
		this.elements.push(child);
		this._createHandle(2 * index + 2);
		if (firstChild) this._createHandle(0);
		this._reorderHandles();
	}

	_createDividerChild(index: number) {
		let firstChild = this.el.childNodes.length == 0;
		let child = document.createElement("div");
		child.classList.add("ejs-layout-divider-child");
		if (2 * index + 1 > this.el.childNodes.length - 1) {
			this.el.appendChild(child);
		} else {
			this.el.insertBefore(child, this.el.childNodes[2 * index + 1]);
		}
		this.elements.push(child);
		this._createHandle(2 * index + 2);
		if (firstChild) this._createHandle(0);
		this._reorderHandles();
	}
	_createHandle(index: number) {
		let child = document.createElement("div");
		child.classList.add("ejs-layout-handle");
		if (index > this.el.childNodes.length - 1) {
			this.el.appendChild(child);
		} else {
			this.el.insertBefore(child, this.el.childNodes[index]);
		}
		this.elements.push(child);

		let button = document.createElement("button");
		button.classList.add("ejs-layout-handle-button");
		child.appendChild(button);
		button.innerHTML = '<i class="ti ti-plus"></i>';
		button.onclick = () => {
			this._createEditorChild(index);
		};
		this._reorderHandles();
	}

	_reorderHandles() {
		this.el
			.querySelectorAll(".ejs-layout-handle-button")
			.forEach((handle, index: number) => {
				(handle as HTMLElement).onclick = () => {
					this._createEditorChild(index);
				};
			});
	}

	save(blockContent: any) {
		return {
			url: "meow meow",
		};
	}
}
