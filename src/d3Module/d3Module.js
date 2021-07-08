import './temp-style.css';
import {Context} from "./scene/context/Context";
import {Focus} from "./scene/focus/Focus";
import {
    createHTMLElement,
    calculateElementsPosition,
    appendAllElementsToContainer
} from "./utils/elementsTools";

export class D3Module {
    FOCUS_WIDTH = 50;
    FOCUS_SELECTOR = 'd3-module-focus';
    CONTEXT_SELECTOR = 'd3-module-context';

    container;
    moduleContainer;
    context;
    focus;

    initScene({selector, width, height, data}) {
        this.#createHTMLScenes({selector, width, height});
        this.#createSVGScenes(data);
        this.#initFocusBrush();
        this.#linkScenes();
    }

    resizeScene(size) {
        this.moduleContainer.style.width = size.width + 'px';
        this.moduleContainer.style.height = size.height + 'px';

        this.focus.resize({
            ...size,
            width: this.FOCUS_WIDTH
        });
    }

    updateData(data) {
        const updatedLengthAndData = calculateElementsPosition(data);
        this.focus.updateMarkersData(updatedLengthAndData);
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

        appendAllElementsToContainer({
            container: this.moduleContainer,
            elements: [htmlFocus, htmlContext]
        });

    }

    #createSVGScenes(data) {
        const calculatedLengthAndData = calculateElementsPosition(data);

        this.#createSVGFocus(calculatedLengthAndData);
        this.#createSVGContext(calculatedLengthAndData);
    }

    #createSVGFocus(data) {
        this.focus = new Focus(document.getElementById(this.FOCUS_SELECTOR));
        this.focus.init(data);
    }

    #createSVGContext({data}) {
        this.context = new Context(document.getElementById(this.CONTEXT_SELECTOR));
        this.context.init({
            boundaries: this.focus.brushSystem.getDefaultSelection(),
            data
        });
    }

    #initFocusBrush() {
        const {brushSystem} = this.focus;
        brushSystem.brush.call(brushSystem.brushArea.move, brushSystem.defaultSelection);
    }

    #linkScenes() {
        this.focus.externalEvent = this.context.changeViewArea;
    }


}