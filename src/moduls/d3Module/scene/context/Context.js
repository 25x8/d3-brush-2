import * as d3 from '../../utils/d3Lib';
import {Scene} from "../Scene";
import {YAxis} from "../../systems/yAxis";
import {elementsConfig} from "../../utils/elementsConfig";
import {getColor} from "../../../interpolateColor";
import {RenderSystem} from "../../systems/RenderSystem";
import {BrushSystem} from "../../systems/BrushSystem";
import mainElementSvg from '../../../../img/icons/test.svg';
import {drawRectangle} from "../../utils/drawElement";
import {SELECT_COLOR, TYPE_K} from "../../../../index";
import {appendWarningIcon, appendWarningIconToDrawingElement} from "../../utils/elementsTools";


export class Context extends Scene {

    elementsData;
    visibleElements;
    selectedElement;

    handleClick;

    hoverline;
    bisect = d3.bisector(d => d.position);

    constructor(container) {
        super(container);
    }

    init({totalLength, minimalLength, data}) {

        minimalLength < this.MAIN_ELEMENT_SIZE && (minimalLength = this.MAIN_ELEMENT_SIZE);

        this.elementsData = data;
        this.visibleElements = data;

        this.setTotalLength(totalLength);
        this.setMinMaxSelection({min: minimalLength});

        this._appendElementsImages();
        this._initYAxis();
        this._initBrush();
        this._initMouseEvents();
        this._initRenderFunction();

        this.render();
    }

    _appendElementsImages() {

        const defs = this.svg.append('defs');

        elementsConfig.forEach(({path, id}) => {
            defs.append('path')
                .attr('d', path)
                .attr('id', id);
        });
    }

    _initYAxis() {

        const endPosition = this.getTotalLength();

        this.yAxis = new YAxis({
            svg: this.svg,
            endPosition
        });
    }

    _initBrush() {

        this.brushSystem = new BrushSystem({
            svg: this.svg,
            yConverter: this.yAxis.y,
            onBrushEnd: ({selection}) => {
                if (selection) {

                    const {
                        convertedSelection,
                        selectionDifference
                    } = this.brushSystem.getSelectionDifference(selection);

                    if (selectionDifference > this.minBrushSelection) {
                        this.externalEvent && this.externalEvent(convertedSelection);
                    }

                    this.brushSystem.clearBrush();
                }
            }
        });

        this.brushSystem.setWheelBoundariesSelection({
            min: this.MAIN_ELEMENT_SIZE,
            max: this.totalLength
        });
    }

    _initMouseEvents() {

        this.hoverline = document.querySelector('#hover-line');

        this.svg
            .on('mouseover', () => {

                this.tooltip.show();
                this.hoverline.classList.add('active');
            })
            .on('mousemove', (e) => {

                this._renderTooltipAndHoverine(e);
            })
            .on('mouseout', () => {

                this.tooltip.hide();
                this.tooltip.removeHoverColor();
                this.hoverline.classList.remove('active');
                this.render()
            })
            .on('wheel', (e) => {
                e.preventDefault();

                const {deltaY} = e;
                const renderWhileWheeling = setInterval(() => {
                    this._renderTooltipAndHoverine(e);
                }, 25);

                setTimeout(() => {
                    clearInterval(renderWhileWheeling);
                }, 200);

                const newTopBorder = this.yAxis.y.invert(e.clientY) + deltaY;

                if (newTopBorder > this.totalLength) {
                    this.externalEvent(this.totalLength - this.yAxis.y.invert(e.clientY))
                } else if (newTopBorder < -50) {
                    return false;
                } else {
                    this.externalEvent(deltaY)
                }
            })
            .on("click", (e) => {
                const elementCoords = this._getCordsAndIndex(e);
                !elementCoords
                    ? this.handleClick(null)
                    : this.handleClick(this.elementsData[elementCoords.index]);

            });
    }

    _renderTooltipAndHoverine(e) {

        const elementCoords = this._getCordsAndIndex(e);

        if (!elementCoords) {
            return undefined
        }

        const {currentX, currentY, index} = elementCoords;

        this.hoverline.style.transform = `translateY(${currentY}px)`;

        this.tooltip.setContent({
            content: Scheme2D.getTooltip(index - 1),
            element: this.elementsData[index]
        });

        this.tooltip.setPosition(currentX, currentY);

        this.render()
    }

    _getCordsAndIndex(e) {
        let {x, y} = this.svg.node().getBoundingClientRect()
        let {clientX: currentX, clientY: currentY} = e;

        currentX -= x;
        currentY -= y;

        const hoveringMeter = this.yAxis.y.invert(currentY);

        if (hoveringMeter >= -1 && hoveringMeter > this.totalLength || hoveringMeter < -50) {
            return undefined;
        }

        const index = this.bisect.left(this.elementsData, hoveringMeter) - 1;

        return {
            currentX,
            currentY,
            index
        }
    }


    _initRenderFunction() {

        const renderSystem = new RenderSystem({
            y: this.yAxis.y,
            scene: this.scene,
            selector: 'd3-module-context-element'
        });

        const context = this;

        renderSystem.initRenderFunctions({

            enter: (enter) => {

                enter.each(function (elementData, index) {

                    if (elementData.id === 'main-element') {

                        const svgElement = d3.select(this).append('image');

                        svgElement
                            .attr('xlink:href', mainElementSvg)
                            .attr('class', renderSystem.selector)


                        context._setSVGElementPosition({svgElement, elementData, index});

                    } else if (elementData.type === TYPE_K) {

                        const svgGroup = d3.select(this).append('g');
                        svgGroup.attr('class', renderSystem.selector);

                        const drawElement = svgGroup.append('path');

                        context._setDrawElementPosition({elementData, drawElement, svgGroup, index});

                    } else {

                        const svgElement = d3.select(this).append('svg').on("click", function (e) {
                            console.log(12312)
                            e.stopPropagation();
                        });
                        ;

                        svgElement
                            .attr('class', renderSystem.selector)
                            .attr('stroke', 'black')
                            .attr('viewBox', d => {
                                const els = elementsConfig.find(el => el.id === d.type);
                                if (els) {
                                    return els.viewBox
                                }
                            });

                        svgElement.append('use').attr('href', d => `#${d.type}`)

                        context._setSVGElementPosition({svgElement, elementData, index});

                        elementData.status && appendWarningIcon({
                            element: svgElement,
                            status: elementData.status,
                            height: context.yAxis.y(elementData.height + context.yAxis.getStartPosition()),
                            position: elementData.position
                        })
                    }


                });

            },
            update: (update) => {


                update.each(function (elementData, index) {

                    if (elementData.type === TYPE_K) {

                        const svgGroup = d3.select(this);
                        const drawElement = svgGroup.select('path');

                        context._setDrawElementPosition({elementData, drawElement, svgGroup, index})

                    } else {

                        const svgElement = d3.select(this);

                        context._setSVGElementPosition({svgElement, elementData, index});

                        elementData.status && appendWarningIcon({
                            element: svgElement,
                            status: elementData.status,
                            height: context.yAxis.y(elementData.height + context.yAxis.getStartPosition()),
                            position: elementData.position
                        })
                    }

                });

            },
        });

        this.render = () => renderSystem.renderElements(this.visibleElements);
    }

    _setSVGElementPosition({svgElement, elementData, index}) {

        const startAxisPosition = this.yAxis.getStartPosition();
        const interpolatedHeight = this.yAxis.y(elementData.height + startAxisPosition);

        svgElement
            .attr('width', interpolatedHeight)
            .attr('height', interpolatedHeight)
            .attr('x', (this.width / 2) - (interpolatedHeight / 2))
            .attr('y', this.yAxis.y(elementData.position))
            .attr('fill', elementData.hovered ? 'yellow' : elementData.select ? SELECT_COLOR : elementData.color)

    }

    _setDrawElementPosition({drawElement, elementData, svgGroup, index}) {

        const startAxisPosition = this.yAxis.getStartPosition();
        const interpolatedHeight = this.yAxis.y(elementData.height + startAxisPosition);
        const interpolatedWidth = this.yAxis.y(elementData.width + startAxisPosition);


        drawElement.attr('d', drawRectangle({
            x: (this.width / 2),
            y: this.yAxis.y(elementData.position),
            width: interpolatedWidth,
            height: interpolatedHeight
        }))
            .attr('stroke', 'black')
            .attr('fill', elementData.hovered ? 'yellow' : elementData.select ? SELECT_COLOR : getColor(index));

        elementData.status && appendWarningIconToDrawingElement({
            element: svgGroup,
            status: elementData.status,
            width: interpolatedWidth / 2,
            x: (this.width / 2) - (elementData.width / 1.5),
            y: this.yAxis.y(elementData.position) + elementData.height
        })
    }

    changeContextArea = (boundaries) => {

        this.yAxis.updateY(boundaries[1], boundaries[0]);
        this._getElementFromRange(boundaries);
        this.render();
    }

    _getElementFromRange(boundaries) {

        let leftPos = this.bisect.center(this.elementsData, boundaries[0]);
        const rightPos = this.bisect.right(this.elementsData, boundaries[1]);

        leftPos > 0 && (leftPos -= 1);

        if (leftPos === rightPos) {
            this.visibleElements = this.elementsData[leftPos - 1];
        } else {
            this.visibleElements = this.elementsData.slice(leftPos, rightPos);
        }

        return this.visibleElements[0];
    }

    updateData({data, minimalLength, totalLength}) {

        minimalLength < this.MAIN_ELEMENT_SIZE && (minimalLength = this.MAIN_ELEMENT_SIZE);

        this.setTotalLength(totalLength);
        this.setMinMaxSelection({min: minimalLength});

        this.brushSystem.setWheelBoundariesSelection({
            min: this.MAIN_ELEMENT_SIZE,
            max: this.totalLength
        });

        this.elementsData = data;
        this.visibleElements = data;
        this.render();
    }

    updateColor({index, color}) {
        const element = this.elementsData[index];
        element.color = color;
    }

    selectElement(id) {

        try {

            this.selectedElement && (this.selectedElement.select = false);
            this.selectedElement = this.elementsData.find(el => el.id === id);
            this.selectedElement.select = true;

            const {position} = this.selectedElement;

            this.externalEvent([position, position + this.minBrushSelection]);

        } catch (e) {
            alert('Выбранный элемент не найден')
        }
    }

    deselectElement() {
        this.selectedElement.select = false;
        this.selectedElement = null;
        this.render();
    }

}