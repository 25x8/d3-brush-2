import * as d3 from '../utils/d3Lib';

export class YAxis {
    y;
    svg;
    axis;
    axisG;

    constructor({svg, endPosition, startPosition= 0,delta = 0}) {
        const height = svg.attr('height');

        this.svg = svg;
        this.y = d3.scaleLinear()
            .domain([endPosition, startPosition])
            .range([height - delta, delta]);
    }

    resize({height, delta= 0}) {
        this.y.range([height - delta, delta]);
        if(this.axisG) {
            this.axis = d3.axisLeft(this.y);
            this.axisG.call(this.axis);
        }
    }

    update = (endPosition, startPosition= 0) => {
        this.y.domain([endPosition, startPosition]);
        if(this.axisG) {
            this.axis = d3.axisLeft(this.y);
            this.axisG.call(this.axis);
        }
    }

    updateY = (endPosition, startPosition= 0) => {
        this.y.domain([endPosition, startPosition]);
    }

    appendYline(position) {

        this.axis = d3.axisLeft(this.y);
        this.axisG = this.svg
            .append('g')
            .attr('class', 'd3-module-y-axis')
            .attr('transform', `translate(${position}, 0)`)
            .call(this.axis);


    }

    getStartPosition() {
        return this.y.domain()[1];
    }
}