import * as d3 from '../utils/d3Lib';

export class Scene {
    container;
    width;
    height;
    svg;
    scene;
    yAxis;
    brushSystem;
    maxBrushSelection = 0;
    minBrushSelection = 0;
    externalEvent;
    render;

    constructor(container) {
        const {width, height} = container.getBoundingClientRect();
        this.container = container;
        this.height = height;
        this.width = width;

        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height]);

        this.scene = this.svg.append('g')
            .attr('class', 'scene');
    }

    resize(size) {
        this.yAxis.resize(size);
        this.brushSystem.resize(size);
        this.resizeHtmlAndSvg(size);
        this.render()
    }

    resizeHtmlAndSvg({width, height}) {

        this.height = height;
        this.width = width;

        d3.select(this.container)
            .style('width', this.width + 'px')
            .style('height', this.height + 'px');

        this.svg
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height]);
    }

    setMinMaxSelection({min, max}) {
        max && (this.maxBrushSelection = max);
        min && (this.minBrushSelection = min);
    }
}