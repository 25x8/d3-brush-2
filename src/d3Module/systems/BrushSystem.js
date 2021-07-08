import * as d3 from '../utils/d3Lib';

export class BrushSystem {
    svg
    brushArea;
    brush;
    defaultSelection;
    yConverter;

    constructor({svg, delta=0, onBrush, onBrushEnd}) {

        const width = svg.attr('width');
        const height = svg.attr('height');

        this.svg = svg;

        this.brushArea = d3.brushY()
            .extent([[0, delta], [width, height - delta]])
            .on('brush', onBrush)
            .on('end', onBrushEnd);

        this.brush = this.svg
            .append('g')
            .attr('class', 'd3-module-brush')
            .call(this.brushArea);
    }

    setDefaultSelection(yTop, yDown) {
        this.defaultSelection = [this.yConverter(yTop), this.yConverter(yDown)]
    }

    getDefaultSelection() {
        return this.defaultSelection.map(this.yConverter.invert)
    }

    resize({width, height, delta}) {
        this.brushArea.extent([[0, delta], [width, height - delta]]);
        this.brush.call(this.brushArea);
    }
}