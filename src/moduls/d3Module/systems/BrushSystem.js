import * as d3 from '../utils/d3Lib';

export class BrushSystem {
    svg
    brushArea;
    brush;
    yConverter;
    defaultSelection;
    currentSelection;
    minSelection;
    maxSelection;

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

        if (boundaries) {

            Array.isArray(boundaries)
                ? this.setCurrentSelection(boundaries)
                : this.setSelectionFromWheel(boundaries);

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

    setWheelBoundariesSelection({min, max}) {
        this.minSelection = min;
        this.maxSelection = max;
    }

    setSelectionFromWheel(deltaY) {

        this.currentSelection = this.currentSelection.map(el => el + deltaY);

        if(this.currentSelection[0] < -this.minSelection) {

            const {selectionDifference} = this.getSelectionDifference(this.getCurrentSelection());

            this.currentSelection[0] = -this.minSelection;
            this.currentSelection[1] = -this.minSelection + selectionDifference;
        }

        if(this.currentSelection[1] > this.maxSelection) {

            const {selectionDifference} = this.getSelectionDifference(this.getCurrentSelection());

            this.currentSelection[0] = this.maxSelection - selectionDifference;
            this.currentSelection[1] = this.maxSelection;
        }
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