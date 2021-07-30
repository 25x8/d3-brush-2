import './temp-style.css';
import {Context} from "./scene/context/Context";
import {Focus} from "./scene/focus/Focus";
import {
    createHTMLElement,
    calculateElementsPosition,
    appendAllElementsToContainer
} from "./utils/elementsTools";
import Tooltip from "./Tooltip/tooltip";

export class D3Module {
    FOCUS_WIDTH = 50;
    FOCUS_SELECTOR = 'd3-module-focus';
    CONTEXT_SELECTOR = 'd3-module-context';
    TOOLTIP_SELECTOR = 'tooltip-context';
    MAIN_ELEMENT_SIZE = 50;

    container;
    moduleContainer;
    context;
    focus;

    initScene({selector, width, height, data}) {
        this.#createHTMLScenes({selector, width, height});
        this.#createSVGScenes(data, width);
        this.#createTooltip();
        this.#linkScenes();
        this.moveBrushToDefault();
    }

    resizeScene({width, height}) {

        this.moduleContainer.style.width = width + 'px';
        this.moduleContainer.style.height = height + 'px';

        this.focus.resize({
            height,
            width: this.FOCUS_WIDTH,
            delta: 10
        });

        this.context.resize({
            height,
            width: width - this.FOCUS_WIDTH
        });
    }

    updateData(data) {

        const updatedLengthAndData = calculateElementsPosition({
            data,
            height: this.moduleContainer.offsetHeight
        });

        this.#addMainElement(updatedLengthAndData);

        this.focus.updateMarkersData({
            ...updatedLengthAndData,
            contextWidth: this.context.width
        });
        this.context.updateData(updatedLengthAndData)
    }

    updateColor({index, color}) {
        this.focus.updateColor({index, color});
        this.context.updateColor({index, color});
    }

    selectElement(id) {
        this.context.selectElement(id)
    }

    deselectElement() {
        this.context.selectedElement && this.context.deselectElement();
        this.moveBrushToDefault();
    }

    #createHTMLScenes({selector, width, height}) {

        this.container = selector instanceof Object
            ? selector
            : document.querySelector(selector);

        this.moduleContainer = createHTMLElement({
            name: 'd3-module-container',
            width,
            height
        });

        this.container.appendChild(this.moduleContainer);

        const htmlFocus = createHTMLElement({
            name: this.FOCUS_SELECTOR,
            width: this.FOCUS_WIDTH,
            height
        });

        const htmlContext = createHTMLElement({
            name: this.CONTEXT_SELECTOR,
            width: width - this.FOCUS_WIDTH,
            height
        });

        const htmlTooltip = createHTMLElement({name: this.TOOLTIP_SELECTOR});

        const htmlHoverLine = createHTMLElement({name: 'hover-line'});

        htmlContext.prepend(htmlHoverLine, htmlTooltip);

        appendAllElementsToContainer({
            container: this.moduleContainer,
            elements: [htmlFocus, htmlContext]
        });

    }

    #createSVGScenes(data, width) {

        const calculatedLengthAndData = calculateElementsPosition({
            data,
            height: this.moduleContainer.offsetHeight
        });

        this.#addMainElement(calculatedLengthAndData);

        this.#createSVGFocus({
            ...calculatedLengthAndData,
            contextWidth: width - this.FOCUS_WIDTH
        });
        this.#createSVGContext(calculatedLengthAndData);
    }

    #createSVGFocus(data) {
        this.focus = new Focus(document.getElementById(this.FOCUS_SELECTOR));
        this.focus.MAIN_ELEMENT_SIZE = this.MAIN_ELEMENT_SIZE;
        this.focus.init(data);
    }

    #createSVGContext(data) {

        this.context = new Context(document.getElementById(this.CONTEXT_SELECTOR));
        this.context.MAIN_ELEMENT_SIZE = this.MAIN_ELEMENT_SIZE;
        this.context.init(data);
    }

    #createTooltip() {
        this.context.tooltip = new Tooltip(`#${this.TOOLTIP_SELECTOR}`);
    }

    moveBrushToDefault() {
        const {brushSystem} = this.focus;

        brushSystem.moveBrushToDefault();
    }

    #linkScenes() {
        this.focus.externalEvent = this.context.changeContextArea;
        this.context.externalEvent = this.focus.changeFocusArea
    }

    #addMainElement({data}) {

        data.unshift({
            "id": "main-element",
            "status": null,
            "work": 0,
            "height": this.MAIN_ELEMENT_SIZE,
            "position": -this.MAIN_ELEMENT_SIZE,
            "type": "main",
        });

        return data
    }

}