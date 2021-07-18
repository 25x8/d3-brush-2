import * as d3 from '../utils/d3Lib';

export class BrushSystem {
    svg
    brushArea;
    brush;
    yConverter;
    defaultSelection;
    currentSelection;

    constructor({svg, delta = 0, yConverter, onBrush, onBrushEnd}) {

        const width = svg.attr('width');
        const height = svg.attr('height');

        this.svg = svg;

        this.brushArea = d3.brushY()
            // .extent([[0, delta], [width, height - delta]])
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
        // this.brushArea.extent([[0, delta], [width, height - delta]]);
        this.brush.call(this.brushArea);

    }

    moveBrush(boundaries) {

        if (boundaries) {
            this.setCurrentSelection(boundaries);

            this.brush
                .transition()
                .call(this.brushArea.move, this.getCurrentSelection());

        } else {
            this.brush
                .call(this.brushArea.move, this.getCurrentSelection())
        }
    }

    moveBrushToDefault() {
        this.brush.call(this.brushArea.move, this.getDefaultSelection());
    }

    clearBrush() {
        this.brush.call(this.brushArea.clear);
    }

    setCurrentSelection(selection) {
        this.currentSelection = selection;
    }

    setDefaultSelection(boundaries) {
        this.defaultSelection = boundaries;
    }

    getCurrentSelection() {
        return this.currentSelection.map(this.yConverter);
    }

    getDefaultSelection() {
        return this.defaultSelection.map(this.yConverter);
    }

    getSelectionDifference(selection) {

        const convertedSelection = selection.map(this.yConverter.invert);

        return {
            convertedSelection,
            selectionDifference: convertedSelection.reduce((a, b) => b - a)
        };
    }
}