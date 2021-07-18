import * as d3 from '../../utils/d3Lib';
import {Scene} from "../Scene";
import {YAxis} from "../../systems/yAxis";
import {elementsConfig} from "../../utils/elementsConfig";
import {getColor} from "../../../interpolateColor";
import {RenderSystem} from "../../systems/RenderSystem";
import {BrushSystem} from "../../systems/BrushSystem";
import mainElementSvg from '../../../img/icons/test.svg';
import {drawRectangle} from "../../utils/drawElement";


export class Context extends Scene {

    elementsData;
    visibleElements;
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
        this.#appendElementsImages();
        this.#initYAxis();
        this.#initBrush();
        this.#initRenderFunction();

        this.render();
    }

    #appendElementsImages() {

        const defs = this.svg.append('defs');

        elementsConfig.forEach(({path, id}) => {
            defs.append('path')
                .attr('d', path)
                .attr('id', id);
        });
    }

    #initYAxis() {

        const endPosition = this.getTotalLength();

        this.yAxis = new YAxis({
            svg: this.svg,
            endPosition
        });
    }

    #initBrush() {

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
    }

    #initRenderFunction() {

        const renderSystem = new RenderSystem({
            y: this.yAxis.y,
            scene: this.scene,
            selector: 'd3-module-context-element'
        });

        renderSystem.initRenderFunctions({

            enter: (enter) => {

                const startAxisPosition = this.yAxis.getStartPosition();

                const context = this;

                enter.each(function (element, index) {

                    if (element.id === 'main-element') {

                        d3.select(this)
                            .append('image')
                            .attr('xlink:href', mainElementSvg)
                            .attr('class', renderSystem.selector)
                            .attr('width', context.yAxis.y(element.height + startAxisPosition))
                            .attr('height', context.yAxis.y(element.height + startAxisPosition))
                            .attr('x', (context.width / 2) - (context.yAxis.y(element.height + startAxisPosition) / 2))
                            .attr('y', context.yAxis.y(element.position))
                            .attr('fill', getColor(index))
                            .attr('stroke', 'black');

                    } else if (element.type === 'k') {

                        d3.select(this)
                            .append('g')
                            .attr('class', renderSystem.selector)
                            .append('path')
                            .attr('d', drawRectangle({
                                x: (context.width / 2),
                                y: context.yAxis.y(element.position),
                                width: context.yAxis.y(element.height + startAxisPosition),
                                height: context.yAxis.y(element.width + startAxisPosition)
                            }))
                            .attr('stroke', '#b47e94')
                            .attr('fill', (d, index) => getColor(index));

                    } else {

                        const svgImage = d3.select(this)
                            .append('svg')
                            .attr('viewBox', d => {
                                const els = elementsConfig.find(el => el.id === d.type);
                                if (els) {
                                    return els.viewBox
                                }
                            })
                            .attr('class', renderSystem.selector)
                            .attr('width', context.yAxis.y(element.height + startAxisPosition))
                            .attr('height', context.yAxis.y(element.height + startAxisPosition))
                            .attr('x', (context.width / 2) - (context.yAxis.y(element.height + startAxisPosition) / 2))
                            .attr('y', context.yAxis.y(element.position))
                            .attr('fill', getColor(index))
                            .attr('stroke', 'black');

                        svgImage.append('use')
                            .attr('href', d => {
                                if (d.type !== 'k')
                                    return `#${d.type}`
                            });
                    }
                })

            },
            update: (update) => {

                const startAxisPosition = this.yAxis.getStartPosition();
                const context = this;

                update.each(function (element) {

                    if (element.type === 'k') {

                        d3.select(this)
                            .select('path')
                            .attr('d', drawRectangle({
                                x: (context.width / 2),
                                y: context.yAxis.y(element.position),
                                width: context.yAxis.y(element.height + startAxisPosition),
                                height: context.yAxis.y(element.width + startAxisPosition)
                            }));
                    } else {

                        d3.select(this)
                            .attr('width', context.yAxis.y(element.height + startAxisPosition))
                            .attr('height', context.yAxis.y(element.height + startAxisPosition))
                            .attr('x', (context.width / 2) - (context.yAxis.y(element.height + startAxisPosition) / 2))
                            .attr('y', context.yAxis.y(element.position))
                    }
                });


            },
        });

        this.render = () => renderSystem.renderElements(this.visibleElements);
    }

    changeContextArea = (boundaries) => {

        this.yAxis.updateY(boundaries[1], boundaries[0]);
        this.#getElementFromRange(boundaries);
        this.render();
    }

    #getElementFromRange(boundaries) {

        let leftPos = this.bisect.center(this.elementsData, boundaries[0]);
        const rightPos = this.bisect.right(this.elementsData, boundaries[1]);

        leftPos > 0 && (leftPos -= 1);

        if (leftPos === rightPos) {
            this.visibleElements = this.elementsData[leftPos - 1];
        } else {
            this.visibleElements = this.elementsData.slice(leftPos, rightPos);
        }
    }

    updateData({data, minimalLength, totalLength}) {

        minimalLength < this.MAIN_ELEMENT_SIZE && (minimalLength = this.MAIN_ELEMENT_SIZE);

        this.setTotalLength(totalLength);
        this.setMinMaxSelection({min: minimalLength});
        this.elementsData = data;
        this.visibleElements = data;
        this.render();
    }

    selectElement(id) {
        try {
            const {position} = this.elementsData.find(el => el.id === id);
            this.externalEvent([position, position + this.minBrushSelection])
        } catch (e) {
            alert('Выбранный элемент не найден')
        }
    }

}