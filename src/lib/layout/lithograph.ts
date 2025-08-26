/*
The layout editor element encapsulates all of layout editing in its entirety. 
It is responsible for the following:
- Parsing layout data passed through props
- Rendering the layout elements and making them editable
- Saving the layout data back to the parent component
- Sorting moving layout data based upon their size and width in the layout

The grid system can be treated similar to a single column, 
*/
import { computePosition } from "@floating-ui/core";
import { platform, flip, offset, shift } from "@floating-ui/dom";
type AnyBlock = typeof Block;
type BlockPositionContext = {
	parent: Lithograph | Block;
	insertBefore: HTMLElement | null;
};

type LithographData = {
	content: BlockSaveData<any>[];
	flex: boolean;
};

export type BlockSaveData<T> = {
	type: string;
	id: string;
	data: T;
};
export class Lithograph {
	container: HTMLElement;
	nestingContainer: HTMLElement;
	toolbar: HTMLElement;
	dropPreview: HTMLElement;
	editorOffset: DOMRect;
	childBlocks: Block[] = [];
	allBlocks: Block[] = []; // ALL blocks, unordered
	blockPositions: { rect: DOMRect; block: Block }[] = [];
	viewGroupElements!: {
		slider: HTMLElement;
		container: HTMLElement;
		elements: { button: HTMLElement; callback: () => void }[];
	};
	previewWindow: HTMLDivElement;
	blockPalette!: HTMLDivElement;
	blockTypes: (typeof Block)[];
	modalContainer!: HTMLElement;
	pageGroupElements!: {
		slider: HTMLDivElement;
		container: HTMLDivElement;
		elements: { button: HTMLDivElement; callback: () => void }[];
	};
	previousTargetIndex!: number;
	startAddBlockX!: number;
	startAddBlockY!: number;
	prevAddBlockX!: number;
	prevAddBlockY!: number;
	addBlockThreshold = 10;
	downBlock!: typeof Block | null;
	addingBlock: boolean = false;
	addBlockDown: boolean = false;
	downConfig!: null;
	addDragPreview!: HTMLElement;
	enablePreview: boolean;
	constructor(configuration: {
		container: HTMLElement;
		blockTypes: AnyBlock[];
		data: LithographData | null;
		enablePreview?: boolean;
	}) {
		this.container = configuration.container;
		this.blockTypes = configuration.blockTypes;
		this.container.classList.add("led-container");
		this.nestingContainer = document.createElement("div");
		this.nestingContainer.classList.add("led-editor");
		this.toolbar = document.createElement("div");
		this.toolbar.classList.add("led-toolbar");
		this.container.appendChild(this.toolbar);
		this.container.appendChild(this.nestingContainer);
		this.dropPreview = document.createElement("span");
		this.dropPreview.classList.add("led-drop-preview");
		this.nestingContainer.appendChild(this.dropPreview);
		this.editorOffset = this.nestingContainer.getBoundingClientRect();
		this.enablePreview = configuration.enablePreview ?? true;

		this.previewWindow = document.createElement("div");
		this.previewWindow.classList.add("led-preview");
		if(this.enablePreview)
			this.container.appendChild(this.previewWindow);

		if (configuration.data != null) {
			configuration.data.content.forEach((blockData) => {
				let blockType = this.blockTypes.find(
					(e) => e.blockName == blockData.type
				);
				if (blockType != null) {
					this.createBlockWithSaveData(blockType, blockData, null);
				}
			});
			if (configuration.data.flex) {
				this.enableFlex();
			}
		}

		//@ts-ignore
		window.lithograph = this;

		this.createToolbar();
		document.addEventListener(
			"pointerup",
			((event: PointerEvent) => {
				this.onPointerUpAddBlock(event);
			}).bind(this)
		);
		document.addEventListener(
			"pointermove",
			((event: PointerEvent) => {
				this.onPointerMoveAddBlock(event);
			}).bind(this)
		);
	}

	enableFlex() {
		this.nestingContainer.classList.add("led-flex-editor");
		this.previewWindow.classList.add("lpv-flex-content");
	}
	disableFlex() {
		this.nestingContainer.classList.remove("led-flex-editor");
		this.previewWindow.classList.remove("lpv-flex-content");
	}

	createToolbar() {
		let topbar = document.createElement("div");
		topbar.classList.add("led-toolbar-topbar");
		this.toolbar.appendChild(topbar);
		let pageGroup = document.createElement("div");
		pageGroup.classList.add("led-toolbar-button-group");
		topbar.appendChild(pageGroup);

		let layoutButton = document.createElement("div");
		layoutButton.classList.add("led-toolbar-button");
		layoutButton.innerHTML = `<i class="ti ti-layout"></i>Layout`;
		pageGroup.appendChild(layoutButton);
		let contentButton = document.createElement("div");
		contentButton.classList.add("led-toolbar-button");
		contentButton.innerHTML = `<i class="ti ti-license"></i>Content`;
		pageGroup.appendChild(contentButton);
		let mediaButton = document.createElement("div");
		mediaButton.classList.add("led-toolbar-button");
		mediaButton.innerHTML = `<i class="ti ti-photo"></i>Media`;
		pageGroup.appendChild(mediaButton);

		let pageGroupSlider = document.createElement("div");
		pageGroupSlider.classList.add("led-toolbar-button-group-slider");
		pageGroup.appendChild(pageGroupSlider);

		this.pageGroupElements = {
			slider: pageGroupSlider,
			container: pageGroup,
			elements: [
				{
					button: layoutButton,
					callback: (() => {
						this.showBlockPalette(
							this.blockTypes.filter((e) => {
								return e.blockType == "layout";
							})
						);
					}).bind(this),
				},
				{
					button: contentButton,
					callback: (() => {
						this.showBlockPalette(
							this.blockTypes.filter((e) => {
								return e.blockType == "content";
							})
						);
					}).bind(this),
				},
				{
					button: mediaButton,
					callback: (() => {
						this.showBlockPalette(
							this.blockTypes.filter((e) => {
								return e.blockType == "media";
							})
						);
					}).bind(this),
				},
			],
		};
		this.pageGroupElements.elements.forEach((e) => {
			e.button.addEventListener(
				"click",
				(() => {
					this.onGroupButtonClick(this.pageGroupElements, e.button);
				}).bind(this)
			);
		});

		if (this.enablePreview) {
			let viewGroup = document.createElement("div");
			viewGroup.classList.add("led-toolbar-button-group");
			topbar.appendChild(viewGroup);

			let editButton = document.createElement("div");
			editButton.classList.add("led-toolbar-button");
			editButton.innerHTML = `<i class="ti ti-pencil"></i>Edit`;
			viewGroup.appendChild(editButton);

			let previewButton = document.createElement("div");
			previewButton.classList.add("led-toolbar-button");
			previewButton.innerHTML = `<i class="ti ti-eye"></i>Preview`;
			viewGroup.appendChild(previewButton);

			let viewGroupSlider = document.createElement("div");
			viewGroupSlider.classList.add("led-toolbar-button-group-slider");
			viewGroup.appendChild(viewGroupSlider);

			this.viewGroupElements = {
				slider: viewGroupSlider,
				container: viewGroup,
				elements: [
					{
						button: editButton,
						callback: (() => {
							this.showEditor();
						}).bind(this),
					},
					{
						button: previewButton,
						callback: (() => {
							this.showPreview();
						}).bind(this),
					},
				],
			};

			this.viewGroupElements.elements.forEach((e) => {
				e.button.addEventListener(
					"click",
					(() => {
						this.onGroupButtonClick(this.viewGroupElements, e.button);
					}).bind(this)
				);
			});
			this.onGroupButtonClick(this.viewGroupElements, editButton);
		}
		this.blockPalette = document.createElement("div");
		this.blockPalette.classList.add("led-toolbar-block-palette");
		this.toolbar.appendChild(this.blockPalette);

		this.onGroupButtonClick(this.pageGroupElements, layoutButton);
	}

	onGroupButtonClick(
		group: {
			slider: HTMLElement;
			container: HTMLElement;
			elements: { button: HTMLElement; callback: () => void }[];
		},
		button: HTMLElement
	) {
		button.classList.add("led-toolbar-button-active");
		group.elements.forEach((element) => {
			if (element.button != button) {
				element.button.classList.remove("led-toolbar-button-active");
			} else {
				element.callback();
			}
		});

		group.slider.style.left =
			button.getBoundingClientRect().left -
			group.container.getBoundingClientRect().left +
			"px";
		group.slider.style.width = button.getBoundingClientRect().width + "px";
		group.slider.style.height = button.getBoundingClientRect().height + "px";
		group.slider.style.top =
			button.getBoundingClientRect().top -
			group.container.getBoundingClientRect().top +
			"px";
	}

	createPaletteButton(name: string, icon: string) {
		let button = document.createElement("div");
		button.classList.add("led-toolbar-block-palette-button");
		button.innerHTML = icon;
		let title = document.createElement("h2");
		title.innerText = name;
		button.appendChild(title);
		return button;
	}

	showBlockPalette(blocks: AnyBlock[]) {
		this.blockPalette.innerHTML = "";
		blocks.forEach(
			((blockType: AnyBlock) => {
				let blockConfigs = blockType.blockConfigurations;
				if (blockConfigs != null) {
					blockConfigs.forEach((config) => {
						let block = new blockType(this, null);
						let button = this.createPaletteButton(config.name, block.icon);
						button.addEventListener(
							"click",
							(() => {
								this.createBlock(blockType, config.configValue);
							}).bind(this)
						);
						button.addEventListener(
							"pointerdown",
							((event: PointerEvent) => {
								this.onPointerDownAddBlock(event);
								this.downBlock = blockType;
								this.downConfig = config.configValue;
							}).bind(this)
						);
						this.blockPalette.appendChild(button);
					});
				} else {
					let block = new blockType(this, null);
					let button = this.createPaletteButton(block.title, block.icon);
					button.addEventListener(
						"click",
						(() => {
							this.createBlock(blockType);
						}).bind(this)
					);
					button.addEventListener(
						"pointerdown",
						((event: PointerEvent) => {
							this.onPointerDownAddBlock(event);
							this.downBlock = blockType;
							this.downConfig = null;
						}).bind(this)
					);
					this.blockPalette.appendChild(button);
				}
			}).bind(this)
		);
	}

	createBlock(
		blockType: new (editor: Lithograph, parent: Block | null) => Block,
		config: any = null,
		position: BlockPositionContext | null = null
	) {
		let block = new blockType(this, null);
		block.createBlock();
		this.childBlocks.push(block);
		this.allBlocks.push(block);
		this.editorOffset = this.nestingContainer.getBoundingClientRect();
		if (config != null) {
			block.configure(config);
		}

		this.calculateHeights();
		if (position != null) {
			this.moveBlock(block, position);
		}
		return block;
	}

	createBlockWithSaveData(
		blockType: new (editor: Lithograph, parent: Block | null) => Block,
		data: BlockSaveData<any>,
		position: BlockPositionContext | null = null
	) {
		let block = new blockType(this, null);
		block.createBlock();
		this.childBlocks.push(block);
		this.allBlocks.push(block);
		this.editorOffset = this.nestingContainer.getBoundingClientRect();
		block.setData(data.data);
		this.calculateHeights();
		if (position != null) {
			this.moveBlock(block, position);
		}
		return block;
	}

	getBlockByNameString(name: string) {
		return this.blockTypes.find((e) => e.blockName == name);
	}

	deleteBlock(block: Block) {
		block.container.remove();
		this.childBlocks.splice(this.childBlocks.indexOf(block), 1);
		this.allBlocks.splice(this.allBlocks.indexOf(block), 1);
		this.calculateHeights();
	}

	calculateHeights() {
		this.editorOffset = this.nestingContainer.getBoundingClientRect();
		this.blockPositions = [];
		//sort the blocks by their position in their parent container
		this.allBlocks.sort((a, b) =>
			this.documentPositionComparator(a.container, b.container)
		);

		this.allBlocks.forEach((block) => {
			let rect = block.container.getBoundingClientRect();
			this.blockPositions.push({ rect, block });
		});
	}

	documentPositionComparator(a: HTMLElement, b: HTMLElement): number {
		if (a === b) {
			return 0;
		}

		var position = a.compareDocumentPosition(b);

		if (
			position & Node.DOCUMENT_POSITION_FOLLOWING ||
			position & Node.DOCUMENT_POSITION_CONTAINED_BY
		) {
			return -1;
		} else if (
			position & Node.DOCUMENT_POSITION_PRECEDING ||
			position & Node.DOCUMENT_POSITION_CONTAINS
		) {
			return 1;
		} else {
			return 0;
		}
	}

	moveBlock(block: Block, blockPositionContext: BlockPositionContext) {
		block.parentElement = blockPositionContext.parent.nestingContainer!;

		//now move the block from this child block to the new parents child block array
		block.parent!.childBlocks.splice(
			block.parent!.childBlocks.indexOf(block),
			1
		);

		blockPositionContext.parent.childBlocks.push(block);

		block.parent = blockPositionContext.parent;
		if (blockPositionContext.insertBefore != null) {
			block.parentElement.insertBefore(
				block.container,
				blockPositionContext.insertBefore
			);
		} else {
			block.parentElement.appendChild(block.container);
		}

		blockPositionContext.parent.childBlocks.sort((a, b) =>
			this.documentPositionComparator(a.container, b.container)
		);
		block.parent!.childBlocks.sort((a, b) =>
			this.documentPositionComparator(a.container, b.container)
		);

		this.calculateHeights();
	}

	showPreview() {
		let html = "";
		this.childBlocks.forEach((block) => {
			html += block.render();
		});
		this.previewWindow.innerHTML = html;
		this.nestingContainer.style.display = "none";
		this.previewWindow.style.display = "";
	}

	showEditor() {
		this.nestingContainer.style.display = "";
		this.previewWindow.style.display = "none";
	}

	onBlockFocus(block: Block) {
		this.allBlocks.forEach((b) => {
			if (b != block) {
				b.container.classList.remove("led-block-focused");
			} else {
				b.container.classList.add("led-block-focused");
			}
		});
	}

	calculateDropPoint(
		mouseX: number,
		mouseY: number,
		selfBlock: Block | null = null
	): BlockPositionContext {
		//group block positions by rows
		let blockPositionsByRowsIntermediate: { rect: DOMRect; block: Block }[][] =
			[];
		let curRow: { rect: DOMRect; block: Block }[];
		let lastTop = 0;
		if (this.blockPositions.length == 0) {
			this.dropPreview.style.left = 15 + "px";
			this.dropPreview.style.top = 10 + "px";
			this.dropPreview.style.width = this.editorOffset.width - 30 + "px";
			this.dropPreview.style.height = "4px";
			return { parent: this, insertBefore: null };
		}
		this.blockPositions.sort((a, b) => a.rect.top - b.rect.top);
		this.blockPositions.forEach((blockRect) => {
			if (blockRect.rect.top != lastTop) {
				lastTop = blockRect.rect.top;
				curRow = [];
				blockPositionsByRowsIntermediate.push(curRow);
			}
			curRow.push(blockRect);
		});

		let blockPositionsByRows: { rect: DOMRect; block: Block }[][] = [];
		//now i need to go through all the rows, sort by the parents of the elements and ensure they all have the same parent. i split rows into different rows if they do not have the same element
		blockPositionsByRowsIntermediate.sort((a, b) => {
			return a[0].block.parentElement.compareDocumentPosition(
				b[0].block.parentElement
			);
		});

		blockPositionsByRowsIntermediate.forEach((row) => {
			let curParent = row[0].block.parentElement;
			curRow = [];
			row.forEach((blockRect) => {
				if (blockRect.block.parentElement != curParent) {
					blockPositionsByRows.push(curRow);
					curRow = [];
					curParent = blockRect.block.parentElement;
				}
				curRow.push(blockRect);
			});
			blockPositionsByRows.push(curRow);
		});

		let highestHoveredBlock: { rect: DOMRect; block: Block } | null;
		let hoveredBlockRow: { rect: DOMRect; block: Block }[] | null = null;
		let closestBlock: { rect: DOMRect; block: Block } | null;
		let closestBlockRow: { rect: DOMRect; block: Block }[] | null = null;
		let hoveredDistance = Infinity;
		let closestDistance = Infinity;
		let hoverPadding = 4;

		//first run the test to find the highest hovered element
		blockPositionsByRows.forEach((row) => {
			row.forEach((blockRect) => {
				// blockRect.block.container.style.outline = "";
				let x = mouseX;
				let y = mouseY;
				//first, we want to check and see if the user is within the bounds of the block. if inside, we will contest for the hovered block, otherwise we will contest for the closest block
				let withinBounds =
					x > blockRect.rect.left + hoverPadding &&
					x < blockRect.rect.right - hoverPadding &&
					y > blockRect.rect.top + hoverPadding &&
					y < blockRect.rect.bottom - hoverPadding;

				if (withinBounds) {
					let hoverDistance =
						mouseX -
						blockRect.rect.left +
						blockRect.rect.right -
						mouseX +
						mouseY -
						blockRect.rect.top +
						blockRect.rect.bottom -
						mouseY;
					if (hoverDistance < hoveredDistance) {
						hoveredDistance = hoverDistance;
						highestHoveredBlock = blockRect;
						hoveredBlockRow = row;
					}
				}
			});
		});

		//then run again so that we can find the closest block that is a child of the highest element
		blockPositionsByRows.forEach((row) => {
			row.forEach((blockRect) => {
				// blockRect.block.container.style.outline = "";
				let x = mouseX;
				let y = mouseY;
				//first, we want to check and see if the user is within the bounds of the block. if inside, we will contest for the hovered block, otherwise we will contest for the closest block
				let withinBounds =
					x > blockRect.rect.left + hoverPadding &&
					x < blockRect.rect.right - hoverPadding &&
					y > blockRect.rect.top + hoverPadding &&
					y < blockRect.rect.bottom - hoverPadding;
				let childTest = true;
				if (highestHoveredBlock != null) {
					childTest = highestHoveredBlock!.block.container.contains(
						blockRect.block.container
					);
				}

				if (!withinBounds && childTest) {
					let dx = Math.max(
						blockRect.rect.left - x,
						0,
						x - blockRect.rect.right
					);
					let dy = Math.max(
						blockRect.rect.top - y,
						0,
						y - blockRect.rect.bottom
					);
					let distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < closestDistance) {
						closestDistance = distance;
						closestBlock = blockRect;
						closestBlockRow = row;
					}
				}
			});
		});

		if (highestHoveredBlock! && highestHoveredBlock.block == selfBlock) {
			let index = selfBlock.parent.childBlocks.indexOf(selfBlock);
			let prepend: HTMLElement | null = null;
			let padding = 20;
			this.dropPreview.style.left =
				highestHoveredBlock!.rect.left -
				this.editorOffset.left +
				padding / 2 +
				"px";
			this.dropPreview.style.top =
				highestHoveredBlock!.rect.top -
				this.editorOffset.top +
				highestHoveredBlock!.rect.height / 2 -
				10 +
				padding / 2 +
				"px";
			this.dropPreview.style.width =
				highestHoveredBlock!.rect.width - padding + "px";
			this.dropPreview.style.height = 4 + "px";

			if (selfBlock.parent.childBlocks[index + 1]) {
				prepend = selfBlock.parent.childBlocks[index + 1].container;
			}
			return {
				parent: selfBlock.parent,
				insertBefore: prepend,
			};
		}

		// if (closestBlock! != null) {
		// 	closestBlock.block.container.style.outline = "2px solid orange";
		// }
		// if (highestHoveredBlock! != null) {
		// 	highestHoveredBlock.block.container.style.outline = "2px solid blue";
		// }

		let relativeToBlock: { rect: DOMRect; block: Block } | null = null;
		let relativeToBlockRow: { rect: DOMRect; block: Block }[];

		if (
			highestHoveredBlock! == null ||
			highestHoveredBlock!.block.isContainerBlock
		) {
			relativeToBlock = closestBlock!;
			relativeToBlockRow = closestBlockRow!;
		}
		if (
			highestHoveredBlock! != null &&
			!highestHoveredBlock!.block.isContainerBlock
		) {
			relativeToBlock = highestHoveredBlock!;
			relativeToBlockRow = hoveredBlockRow!;
		}

		let horPadding = 30;
		let vertPadding = 20;

		if (
			relativeToBlock == null &&
			closestBlock! == null &&
			highestHoveredBlock! != null
		) {
			let containerRect =
				highestHoveredBlock!.block.nestingContainer?.getBoundingClientRect();
			if (containerRect != null) {
				this.dropPreview.classList.add("led-drop-preview-horizontal");
				this.dropPreview.style.left =
					containerRect.left - this.editorOffset.left + horPadding / 2 + "px";
				this.dropPreview.style.top =
					containerRect.top - this.editorOffset.top + 2 + "px";
				this.dropPreview.style.width = containerRect.width - horPadding + "px";
				this.dropPreview.style.height = "4px";
			}
			return {
				parent: highestHoveredBlock!.block,
				insertBefore: null,
			};
		}
		if (relativeToBlock == null) {
			return {
				parent: this,
				insertBefore: null,
			};
		}
		let distX =
			mouseX - (relativeToBlock.rect.left + relativeToBlock.rect.width / 2);
		let distY =
			mouseY - (relativeToBlock.rect.top + relativeToBlock.rect.height / 2);

		if (relativeToBlock.block == selfBlock) {
		}

		let placeAsRow = false;
		let placeAsColumn = false;

		let horizontalMinimum = 0;
		let verticalMinimum = 0;

		if (relativeToBlock.rect.width > relativeToBlock.rect.height) {
			let halfHeight = relativeToBlock.rect.height / 2;
			horizontalMinimum = relativeToBlock.rect.width / 2;
			horizontalMinimum -= halfHeight;
		} else {
			let halfWidth = relativeToBlock.rect.width / 2;
			verticalMinimum = relativeToBlock.rect.height / 2;
			verticalMinimum -= halfWidth;
		}

		if (Math.abs(distX) < horizontalMinimum) {
			distX = 0;
		}
		if (Math.abs(distY) < verticalMinimum) {
			distY = 0;
		}

		if (Math.abs(distY) > Math.abs(distX)) {
			placeAsRow = true;
		} else {
			placeAsColumn = true;
		}
		if (placeAsRow) {
			let offset = distY > 0 ? 1 : -1;
			let index = this.blockPositions.indexOf(relativeToBlock);
			index += offset;
		} else if (placeAsColumn) {
			let index = this.blockPositions.indexOf(relativeToBlock);
			index += distX > 0 ? 1 : 0;
		}
		this.dropPreview.classList.add("led-drop-preview-visible");

		let placeAtIndex = -1;

		let targetDropIndex = -1;

		let blockPositionContext: BlockPositionContext = {
			parent: this,
			insertBefore: null,
		};
		if (placeAsRow) {
			blockPositionContext.parent = relativeToBlock!.block.parent;
			let offset = distY > 0 ? 1 : 0;
			let firstBlock = relativeToBlockRow![0];
			let lastBlock = relativeToBlockRow![relativeToBlockRow!.length - 1];
			let parent = relativeToBlock!.block.parent!;

			let prependBlock: Block | null = null;
			let placeAfter = false;
			if (offset) {
				let indexOfLast = parent.childBlocks.indexOf(lastBlock.block)!;
				if (parent.childBlocks[indexOfLast + 1]) {
					prependBlock = parent.childBlocks[indexOfLast + 1];
				}
				placeAfter = true;
			} else {
				prependBlock = firstBlock.block;
			}

			let tallestInRow = 0;
			relativeToBlockRow!.forEach((block) => {
				if (block.rect.height > tallestInRow) {
					tallestInRow = block.rect.height;
				}
			});

			if (prependBlock) {
				blockPositionContext.insertBefore = prependBlock.container;
			}
			let containerRect =
				firstBlock.block.parentElement.getBoundingClientRect();
			this.dropPreview.style.left =
				containerRect.left + horPadding / 2 - this.editorOffset.left + "px";
			this.dropPreview.style.top =
				firstBlock.rect.top -
				this.editorOffset.top +
				(placeAfter ? 2 : -6) +
				(placeAfter ? tallestInRow : 0) +
				"px";
			this.dropPreview.style.width = containerRect.width - horPadding + "px";
			this.dropPreview.style.height = "4px";
		} else if (placeAsColumn) {
			blockPositionContext.parent = relativeToBlock!.block.parent;
			let offset = distX > 0 ? 1 : 0;
			//if offset is 0, then just simply prepend to the relative block
			//if offset is 1, then look for the next block that is a child of this parent, and prepend to that
			//if it does not exist, append
			let parent = relativeToBlock!.block.parent!;
			let prependBlock: Block | null = null;
			let placeAfter = false;
			if (offset) {
				let indexOfRelative = parent.childBlocks.indexOf(
					relativeToBlock!.block
				);
				if (parent.childBlocks[indexOfRelative + 1]) {
					prependBlock = parent.childBlocks[indexOfRelative + 1];
				}
				placeAfter = true;
			} else {
				prependBlock = relativeToBlock!.block;
			}
			if (prependBlock) {
				blockPositionContext.insertBefore = prependBlock.container;
			}
			this.dropPreview.style.left =
				relativeToBlock!.rect.left -
				this.editorOffset.left +
				(placeAfter ? 2 : -6) +
				(placeAfter ? relativeToBlock.rect.width : 0) +
				"px";
			this.dropPreview.style.top =
				relativeToBlock!.rect.top -
				this.editorOffset.top +
				vertPadding / 2 +
				"px";
			this.dropPreview.style.width = "4px";
			this.dropPreview.style.height =
				relativeToBlock!.rect.height - vertPadding + "px";
		}
		return blockPositionContext;
	}

	onPointerDownAddBlock(event: PointerEvent) {
		this.calculateHeights();
		this.startAddBlockX = event.clientX;
		this.startAddBlockY = event.clientY;
		this.addingBlock = false;
		this.addBlockDown = true;
	}
	onPointerMoveAddBlock(event: PointerEvent) {
		if (!this.addBlockDown) return;
		this.prevAddBlockX = event.clientX;
		this.prevAddBlockY = event.clientY;

		if (
			!this.addingBlock &&
			(Math.abs(this.prevAddBlockX - this.startAddBlockX) >
				this.addBlockThreshold ||
				Math.abs(this.prevAddBlockY - this.startAddBlockY) >
					this.addBlockThreshold)
		) {
			this.addingBlock = true;
			let block = new this.downBlock!(this, null);
			this.addDragPreview = this.createPaletteButton(block.title, block.icon);
			this.addDragPreview.classList.add("led-drag-add-preview");
			this.addDragPreview.style.left = event.clientX + "px";
			this.addDragPreview.style.top = event.clientY + "px";
			document.body.appendChild(this.addDragPreview);
		}
		if (this.addingBlock) {
			this.dropPreview.classList.add("led-drop-preview-visible");
			this.calculateDropPoint(event.clientX, event.clientY);
			this.addDragPreview.style.left = event.clientX + "px";
			this.addDragPreview.style.top = event.clientY + "px";
		}
	}
	onPointerUpAddBlock(event: PointerEvent) {
		let cancel = false;
		if (!this.addBlockDown || !this.addingBlock || !this.downBlock) {
			cancel = true;
			this.downBlock = null;
		}
		this.addingBlock = false;
		this.addBlockDown = false;
		if (cancel) return;
		let index = this.calculateDropPoint(event.clientX, event.clientY);
		this.createBlock(this.downBlock!, this.downConfig, index);
		this.dropPreview.classList.remove("led-drop-preview-visible");
		this.addDragPreview.remove();
		this.downBlock = null;
	}

	openSettings(block: Block) {}

	createModal(modalElement: HTMLElement) {
		this.modalContainer = document.createElement("div");
		this.modalContainer.classList.add("led-modal");
		document.body.appendChild(this.modalContainer);
		this.modalContainer.appendChild(modalElement);
	}

	closeModal() {
		this.modalContainer.classList.add("led-modal-out");
		setTimeout(() => {
			this.modalContainer.remove();
		}, 300);
	}

	getJSON() {
		let json: BlockSaveData<any>[] = [];
		this.childBlocks.forEach((block) => {
			json.push(block.save());
		});
		return json;
	}

	createTooltip(
		relativeObject: HTMLElement,
		content: HTMLElement[]
	): HTMLElement {
		let tooltip = document.createElement("div");
		tooltip.classList.add("led-tooltip");
		content.forEach((element) => {
			tooltip.appendChild(element);
		});
		document.body.appendChild(tooltip);
		computePosition(relativeObject, tooltip, {
			placement: "top",
			platform,
			middleware: [offset(6)],
		}).then(({ x, y }) => {
			Object.assign(tooltip.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});
		return tooltip;
	}
	closeTooltip(tooltip: HTMLElement) {
		tooltip.remove();
	}
}

export class Block {
	id: string = crypto.randomUUID();
	editor: Lithograph;
	parent: Block | Lithograph;
	parentElement: HTMLElement;
	contentContainer!: HTMLElement;
	topBar!: HTMLElement;
	container!: HTMLElement;
	title: string;
	titleElement!: HTMLElement;
	leftButtonContainer!: HTMLElement;
	moveableContainer!: HTMLElement;
	pointerDown: boolean = false;
	width: number = 0;
	height: number = 0;
	pullDeltaX: number = 0;
	pullDeltaY: number = 0;
	pullThreshold: number = 10;
	prevX: number = 0;
	prevY: number = 0;
	posX: number = 0;
	posY: number = 0;
	moving: boolean = false;
	targetDropIndex!: BlockPositionContext;
	icon: string = `<i class="ti ti-blocks"></i>`;
	baseRotation: number = 0;
	targetRotation: number = 0;
	rotation: number = 0;
	targetScale: number = 1;
	scale: number = 1;
	targetX: number = 0;
	targetY: number = 0;
	x: number = 0;
	y: number = 0;
	stopLerpWhenWithinThreshold = true;
	runningDragLerp = false;
	rotationLerpSpeed = 0.1;
	originX = 0;
	originY = 0;

	isContainerBlock = false;
	nestingContainer: HTMLElement | null = null;
	childBlocks: Block[] = [];

	validFocusElements: HTMLElement[] = [];

	constructor(editor: Lithograph, parent: Block | null) {
		this.editor = editor;
		this.parent = parent ?? editor;
		this.parentElement = parent
			? parent.nestingContainer!
			: editor.nestingContainer;
		this.title = "Block";
	}
	createBlock() {
		this.moveableContainer = document.createElement("div");
		this.moveableContainer.classList.add("led-block-moveable-container");
		this.contentContainer = document.createElement("div");
		this.contentContainer.classList.add("led-block-content-container");
		this.topBar = document.createElement("div");
		this.topBar.classList.add("led-block-top-bar");
		this.container = document.createElement("div");
		this.container.classList.add("led-block-container");
		this.container.appendChild(this.moveableContainer);
		this.moveableContainer.appendChild(this.topBar);
		this.moveableContainer.appendChild(this.contentContainer);
		this.parentElement.appendChild(this.container);
		this.titleElement = document.createElement("div");
		this.titleElement.classList.add("led-block-title");
		this.titleElement.innerText = this.title;

		this.leftButtonContainer = document.createElement("div");
		this.leftButtonContainer.classList.add("led-block-left-button-container");
		this.topBar.appendChild(this.leftButtonContainer);
		this.leftButtonContainer.appendChild(this.titleElement);

		let buttons = this.renderTopbarButtons();

		buttons.forEach((button) => {
			this.leftButtonContainer.appendChild(button);
		});

		let deleteButton = document.createElement("button");
		deleteButton.innerHTML = `<i class="ti ti-trash"></i>`;
		deleteButton.classList.add("led-top-bar-button");
		deleteButton.onclick = this.deleteBlock.bind(this);
		this.topBar.appendChild(deleteButton);

		this.topBar.addEventListener("pointerdown", this.onPointerDown.bind(this));
		document.addEventListener("pointermove", this.onPointerMove.bind(this));
		document.addEventListener("pointerup", this.onPointerUp.bind(this));

		let focusEl = [
			this.topBar,
			this.contentContainer,
			this.moveableContainer,
			this.container,
		];
		this.validFocusElements.push(...focusEl);
		this.container.addEventListener("click", this.focus.bind(this));
	}

	configure(...args: any[]) {}
	setData(data: any) {}

	renderTopbarButtons(): HTMLElement[] {
		return [];
	}

	deleteBlock() {
		this.editor.deleteBlock(this);
	}

	static get blockType() {
		return "";
	}
	static get blockName() {
		return "";
	}

	static get blockConfigurations():
		| { name: string; configValue: any }[]
		| null {
		return null;
	}

	onPointerDown(event: PointerEvent) {
		if (event.target != this.topBar) return;
		this.pointerDown = true;
		event.preventDefault();
		event.stopPropagation();
		this.editor.calculateHeights();
		//copy the moveable containers size and apply it to the block container, which will be used to keep the blocks size
		let rect = this.moveableContainer.getBoundingClientRect();
		this.width = rect.width;
		this.height = rect.height;

		this.container.style.width = this.width + "px";
		this.container.style.height = this.height + "px";

		this.moveableContainer.style.width = this.width + "px";
		this.moveableContainer.style.height = this.height + "px";
		let correctRect;
		if (this.parent instanceof Lithograph) {
			correctRect = this.parent.nestingContainer.getBoundingClientRect();
		} else {
			correctRect = this.parent.container!.getBoundingClientRect();
		}
		this.posX = rect.left - correctRect.left;
		this.posY = rect.top - correctRect.top;
		this.moveableContainer.style.left = this.posX + "px";
		this.moveableContainer.style.top = this.posY + "px";

		this.x = this.y = this.targetX = this.targetY = 0;
		this.originX = (event.clientX - rect.left) / rect.width;
		this.originY = (event.clientY - rect.top) / rect.height;
		this.moveableContainer.style.transformOrigin = `${this.originX * 100}% ${
			this.originY * 100
		}%`;
		this.baseRotation =
			-5 * (((event.clientX - rect.left - rect.width / 2) / rect.width) * 2);

		this.moveableContainer.classList.add("led-block-moveable-container-active");
		this.moveableContainer.classList.add("led-block-moveable-container-zindex");
		this.prevX = event.clientX;
		this.prevY = event.clientY;
	}
	onPointerMove(event: PointerEvent) {
		if (!this.pointerDown) return;

		if (!this.moving) {
			this.pullDeltaX += Math.abs(event.clientX - this.prevX);
			this.pullDeltaY += Math.abs(event.clientY - this.prevY);
			if (this.pullDeltaX + this.pullDeltaY > this.pullThreshold) {
				this.moving = true;
				this.moveableContainer.classList.add(
					"led-block-moveable-container-moving"
				);
				this.rotationLerpSpeed = 0.1;
				this.targetScale = 0.67;
				this.targetRotation = this.baseRotation;
				this.stopLerpWhenWithinThreshold = false;
				if (!this.runningDragLerp)
					requestAnimationFrame(this.dragLerp.bind(this));
			}
		}

		if (this.moving) {
			this.posX += event.clientX - this.prevX;
			this.posY += event.clientY - this.prevY;
			this.targetRotation = this.baseRotation + (event.clientX - this.prevX);
			this.moveableContainer.style.left = this.posX + "px";
			this.moveableContainer.style.top = this.posY + "px";
		}

		this.targetDropIndex = this.editor.calculateDropPoint(
			event.clientX,
			event.clientY,
			this
		);
		this.prevX = event.clientX;
		this.prevY = event.clientY;
	}
	onPointerUp(event: PointerEvent) {
		if (!this.pointerDown) return;
		this.moveableContainer.classList.add("led-block-moveable-notransition");

		if (this.moving) this.editor.moveBlock(this, this.targetDropIndex);

		let rect = this.container.getBoundingClientRect();
		let mRect = this.moveableContainer.getBoundingClientRect();
		let tx = rect.left + rect.width * this.originX;
		let ty = rect.top + rect.height * this.originY;
		let px = event.clientX - tx;
		let py = event.clientY - ty;
		this.x = px;
		this.y = py;
		this.moveableContainer.style.setProperty("--transform-x", this.x + "px");
		this.moveableContainer.style.setProperty("--transform-y", this.y + "px");
		this.targetX = 0;
		this.targetY = 0;
		this.targetRotation = 0;
		this.baseRotation = 0;
		this.targetScale = 1;
		this.stopLerpWhenWithinThreshold = true;
		this.rotationLerpSpeed = 0.2;
		setTimeout(() => {
			this.moveableContainer.style.setProperty("--transform-x", "0px");
			this.moveableContainer.style.setProperty("--transform-y", "0px");
			this.moveableContainer.classList.remove(
				"led-block-moveable-notransition"
			);
			this.moveableContainer.classList.remove(
				"led-block-moveable-container-moving"
			);
			this.moveableContainer.classList.remove(
				"led-block-moveable-container-active"
			);
			this.container.style.width = "";
			this.container.style.height = "";
		}, 1);

		this.editor.dropPreview.classList.remove("led-drop-preview-visible");
		setTimeout(() => {
			this.moveableContainer.classList.remove(
				"led-block-moveable-container-zindex"
			);
		}, 300);

		this.moveableContainer.style.width = "";
		this.moveableContainer.style.height = "";
		this.moveableContainer.style.left = "";
		this.moveableContainer.style.top = "";
		this.pullDeltaX = 0;
		this.pullDeltaY = 0;

		this.pointerDown = false;
		this.moving = false;
	}

	dragLerp() {
		this.runningDragLerp = true;
		this.rotation = lerp(
			this.rotation,
			this.targetRotation,
			this.rotationLerpSpeed
		);
		this.scale = lerp(this.scale, this.targetScale, 0.2);
		this.x = lerp(this.x, this.targetX, 0.2);
		this.y = lerp(this.y, this.targetY, 0.2);
		this.moveableContainer.style.setProperty("--transform-x", this.x + "px");
		this.moveableContainer.style.setProperty("--transform-y", this.y + "px");
		this.moveableContainer.style.setProperty("--scale", this.scale.toString());
		this.moveableContainer.style.setProperty("--rotate", this.rotation + "deg");
		if (
			this.stopLerpWhenWithinThreshold &&
			Math.abs(this.targetRotation - this.rotation) < 0.1 &&
			Math.abs(this.targetScale - this.scale) < 0.1 &&
			Math.abs(this.targetX - this.x) < 0.1 &&
			Math.abs(this.targetY - this.y) < 0.1
		) {
			this.runningDragLerp = false;
			this.moveableContainer.style.setProperty(
				"--transform-x",
				this.targetX + "px"
			);
			this.moveableContainer.style.setProperty(
				"--transform-y",
				this.targetY + "px"
			);
			this.moveableContainer.style.setProperty(
				"--scale",
				this.targetScale.toString()
			);
			this.moveableContainer.style.setProperty(
				"--rotate",
				this.targetRotation + "deg"
			);
			return;
		}
		requestAnimationFrame(this.dragLerp.bind(this));
	}

	focus(event: MouseEvent | null, bypassCheck: boolean = false) {
		if (bypassCheck) {
			this.editor.onBlockFocus(this);
			return;
		}
		if (event == null) return;
		if (this.validFocusElements.includes(event.target as HTMLElement)) {
			this.editor.onBlockFocus(this);
		}
	}

	save(): BlockSaveData<any> {
		return {
			type: "blank",
			id: "NO_ID",
			data: {},
		};
	}

	render() {
		return `[ERROR] This [${this.title}] block does not have a render method!`;
	}
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
