import * as d3 from '../utils/d3Lib';

export class BrushSystem {
    svg
    brushArea;
    brush;
    defaultSelection;
    yConverter;
    currentBoundaries;

    constructor({svg, delta = 0, yConverter, onBrush, onBrushEnd}) {

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

        this.yConverter = yConverter;
    }

    resize({width, height, delta = 0}) {

        this.defaultSelection = [delta, height - delta];
        this.brushArea.extent([[0, delta], [width, height - delta]]);
        this.brush.call(this.brushArea);
    }

    moveBrush(boundaries) {

        boundaries && this.setCurrentSelection(boundaries);
        this.brush
            .transition()
            .call(this.brushArea.move, this.getCurrentSelection());
    }

    moveBrushToDefault() {
        this.brush
            .call(this.brushArea.move, this.getDefaultSelection());
    }

    setCurrentSelection(boundaries) {
        this.currentBoundaries = boundaries.map(this.yConverter.invert);
    }

    getCurrentSelection() {
        return this.currentBoundaries && this.currentBoundaries.map(this.yConverter);
    }


    setDefaultSelection(boundaries) {
        this.defaultSelection = boundaries.map(this.yConverter);
    }

    getDefaultSelection() {
        return this.defaultSelection;
    }
}