import * as d3 from '../../utils/d3Lib';
import {Scene} from "../Scene";
import {YAxis} from "../../systems/yAxis";
import {elementsConfig} from "../../utils/elementsConfig";
import {getColor} from "../../../interpolateColor";
import {RenderSystem} from "../../systems/RenderSystem";
import {BrushSystem} from "../../systems/BrushSystem";


export class Context extends Scene {

    elementsData;
    visibleElements;
    bisect = d3.bisector(d => d.position);


    constructor(container) {
        super(container);
    }

    init({totalLength, data}) {

        this.elementsData = data;
        this.visibleElements = data;

        this.#appendElementsImages();
        this.#initYAxis(totalLength);
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

    #initYAxis(endPosition) {
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
                    this.externalEvent && this.externalEvent(selection.map(this.yAxis.y.invert));
                    this.brushSystem.brush.call(this.brushSystem.brushArea.clear);
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

                const svgImage = enter.append('svg')
                    .attr('viewBox', d => {
                        const els = elementsConfig.find(el => el.id === d.type);
                        if (els) {
                            return els.viewBox
                        }
                    })
                    .attr('class', renderSystem.selector)
                    .attr('width', d => this.yAxis.y(d.height + startAxisPosition))
                    .attr('height', d => this.yAxis.y(d.height + startAxisPosition))
                    .attr('x', d => (this.width / 2) - (this.yAxis.y(d.height + startAxisPosition) / 2))
                    .attr('y', d => this.yAxis.y(d.position))
                    .attr('fill', (d, index) => getColor(index))
                    .attr('stroke', 'black');

                svgImage.append('use')
                    .attr('href', d => {
                        if (d.type !== 'k')
                            return `#${d.type}`
                    });
            },
            update: (update) => {
                const startAxisPosition = this.yAxis.getStartPosition();
                update
                    .attr('width', d => this.yAxis.y(d.height + startAxisPosition))
                    .attr('height', d => this.yAxis.y(d.height + startAxisPosition))
                    .attr('x', d => (this.width / 2) - (this.yAxis.y(d.height + startAxisPosition) / 2))
                    .attr('y', d => this.yAxis.y(d.position))
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

        leftPos > 0 && (leftPos -= 1)

        if (leftPos === rightPos) {
            this.visibleElements = this.elementsData[leftPos - 1];
        } else {
            this.visibleElements = this.elementsData.slice(leftPos, rightPos);
        }
    }

    updateData({data}) {
        this.elementsData = data;
        this.visibleElements = data;
        this.render();
    }

}