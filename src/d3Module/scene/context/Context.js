import {Scene} from "../Scene";
import {YAxis} from "../../systems/yAxis";
import {elementsConfig} from "../../utils/elementsConfig";
import * as d3 from '../../utils/d3Lib';
import {getColor} from "../../../interpolateColor";

export class Context extends Scene {

    elementsData;
    visibleElements;
    bisect = d3.bisector(d => d.position)

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

        this.yAxis = new YAxis({
            svg: this.svg,
            startLength: boundaries[0],
            endLength: boundaries[1]
        });

        this.elementsData = data;
        this.visibleElements = data;

        this.#renderElements();
    }

    changeViewArea = (boundaries) => {

        this.yAxis.updateY(boundaries[1], boundaries[0]);
        this.#getElementFromRange(boundaries);
        this.#renderElements();
    }

    #renderElements() {
        this.scene.selectAll('.d3-module-context-element')
            .data(this.visibleElements, d => d.id)
            .join(
                enter => this.#appendElements(enter),
                update => this.#updateElements(update),
                exit => exit.remove()
            )
    }

    #appendElements(enter) {

        const startAxisPosition = this.yAxis.getStartPostion();
        const svgImage = enter.append('svg')
            .attr('viewBox', d => {
                const els = elementsConfig.find(el => el.id === d.type);
                if (els) {
                    return els.viewBox
                }
            })
            .attr('class', 'd3-module-context-element')
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
    }

    #updateElements(update) {
        const startAxisPosition = this.yAxis.getStartPostion();
        update
            .attr('width', d => this.yAxis.y(d.height + startAxisPosition))
            .attr('height', d =>  {
                return this.yAxis.y(d.height + startAxisPosition)
            })
            .attr('x', d => (this.width / 2) - (this.yAxis.y(d.height + startAxisPosition) / 2))
            .attr('y', d => this.yAxis.y(d.position))

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