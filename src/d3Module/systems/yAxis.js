import * as d3 from '../utils/d3Lib';

export class YAxis {
    y;
    svg;
    axis;

    constructor({svg, endLength, startLength=0,delta = 0}) {

        const height = svg.attr('height');

        this.svg = svg;
        this.y = d3.scaleLinear()
            .domain([endLength, startLength])
            .range([height - delta, delta]);
    }

    resize({height, delta}) {
        this.y.range([height - delta, delta])
        this.axis.call(d3.axisLeft(this.y))
    }

    updateY = (rangeEnd, rangeStart) => {
        this.y.domain([rangeEnd, rangeStart])
    }

    update = (rangeEnd, rangeStart=0) => {
        this.y.domain([rangeEnd, rangeStart])
        this.axis.call(d3.axisLeft(this.y))
    }

    appendYline(position) {
        this.axis = this.svg
            .append('g')
            .attr('class', 'd3-module-y-axis')
            .attr('transform', `translate(${position}, 0)`)
            .call(d3.axisLeft(this.y));
    }

    getStartPostion() {
        return this.y.domain()[1];
    }
}