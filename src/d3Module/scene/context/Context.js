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

        const defs = this.svg.append('defs');

        elementsConfig.forEach(({path, id}) => {
            defs.append('path')
                .attr('d', path)
                .attr('id', id);
        })

    }

    init({boundaries, data}) {

        this.elementsData = data;
        this.visibleElements = data;

        this.#initYAxis(boundaries);
        this.#initBrush();
        this.#initRenderFunction();

        this.render();
    }

    #initYAxis(boundaries) {
        this.yAxis = new YAxis({
            svg: this.svg,
            startLength: boundaries[0],
            endLength: boundaries[1]
        });
    }

    #initBrush() {
        this.brushSystem = new BrushSystem({
            svg: this.svg,
            onBrush: (e) => {
                this.externalEvent && this.externalEvent(e.selection.map(this.yAxis.y.invert));
            },
            onBrushEnd: ({selection}) => {
                if (!selection) {
                    this.brushSystem.brush.call(this.brushSystem.brushArea.move, this.brushSystem.defaultSelection);
                }
            }
        })
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
            }
        });

        this.render = () => renderSystem.renderElements(this.visibleElements);
    }

    changeViewArea = (boundaries) => {
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


}