import './styles.css';
import {Context} from "./scene/context/Context";
import {Focus} from "./scene/focus/Focus";
import {
    createHTMLElement,
    calculateElementsPosition,
    appendAllElementsToContainer
} from "./utils/elementsTools";
import Tooltip from "./Tooltip/tooltip";
import {elementsConfig} from "./utils/elementsConfig";
import {TYPE_K} from "../../index";

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

    initScene({selector, width, height, data, onClick}) {
        this._calculateAspectInSvgElements();
        this._addWidthInSvgElements(data);
        this._createHTMLScenes({selector, width, height});
        this._createSVGScenes(data, width);
        this._createTooltip();
        this._linkScenes();
        this.moveBrushToDefault();
        this._addClickEventOnContext(onClick)
    }

    resizeScene({width, height}) {

        this.moduleContainer.style.width = width + 'px';
        this.moduleContainer.style.height = height + 'px';

        this.focus.resize({
            height,
            width: this.FOCUS_WIDTH,
            data: this.context.elementsData
        }, width - this.FOCUS_WIDTH);

        this.context.resize({
            height,
            width: width - this.FOCUS_WIDTH
        });
    }

    updateData(data) {
        this._addWidthInSvgElements(data);
        const updatedLengthAndData = calculateElementsPosition({
            data,
            height: this.moduleContainer.offsetHeight,
            contextWidth: this.context.width
        });

        this._addMainElement(updatedLengthAndData);

        this.context.updateData(updatedLengthAndData)


        this.focus.updateMarkersData({
            ...updatedLengthAndData,
            contextWidth: this.context.width
        });

    }

    updateContextColor({index, color}) {
        this.context.updateColor({index, color});
    }

    updateFocusColor() {
        this.focus.updateColor(this.context.elementsData);
    }

    selectElement(index) {
        console.log(index)
        this.context.selectElement(index, this.focus.brushSystem.defaultSelectionDifference)
    }

    deselectElement() {
        this.context.selectedElement && this.context.deselectElement();
        this.moveBrushToDefault();
    }

    _createHTMLScenes({selector, width, height}) {

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

        document.querySelector('body').prepend(htmlTooltip)

        htmlContext.prepend(htmlHoverLine);

        appendAllElementsToContainer({
            container: this.moduleContainer,
            elements: [htmlFocus, htmlContext]
        });

    }

    _createSVGScenes(data, width) {

        const calculatedLengthAndData = calculateElementsPosition({
            data,
            height: this.moduleContainer.offsetHeight,
            contextWidth: width - this.FOCUS_WIDTH
        });

        this._addMainElement(calculatedLengthAndData);

        this._createSVGFocus({
            ...calculatedLengthAndData,
            contextWidth: width - this.FOCUS_WIDTH
        });
        this._createSVGContext(calculatedLengthAndData);
    }

    _createSVGFocus(data) {
        this.focus = new Focus(document.getElementById(this.FOCUS_SELECTOR));
        this.focus.MAIN_ELEMENT_SIZE = this.MAIN_ELEMENT_SIZE;
        this.focus.init(data);
    }

    _createSVGContext(data) {

        this.context = new Context(document.getElementById(this.CONTEXT_SELECTOR));
        this.context.MAIN_ELEMENT_SIZE = this.MAIN_ELEMENT_SIZE;
        this.context.init(data);
    }

    _createTooltip() {
        this.context.tooltip = new Tooltip(`#${this.TOOLTIP_SELECTOR}`);
    }

    moveBrushToDefault() {
        const {brushSystem} = this.focus;

        brushSystem.moveBrushToDefault();
    }

    _linkScenes() {
        this.focus.externalEvent = this.context.changeContextArea;
        this.context.externalEvent = this.focus.changeFocusArea
    }

    _addMainElement({data}) {

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

    _addClickEventOnContext(event) {
        this.context.handleClick = event;
    }

    _calculateAspectInSvgElements() {
        elementsConfig.forEach(el => {
            const [, , width, height] = el.viewBox.split(" ");
            el.widthAspect = height / width;
        });
    }

    _addWidthInSvgElements(data) {
        data.forEach(el => {
            if(el.type !== TYPE_K) {
                el.width =
                    el.height / elementsConfig.find(conf => conf.id === el.type).widthAspect;
            }
        });
    }

}