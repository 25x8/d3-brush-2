import {Scene} from "../Scene";
import {BrushSystem} from "../../systems/BrushSystem";
import {YAxis} from "../../systems/yAxis";
import {getColor} from "../../../interpolateColor";
import {RenderSystem} from "../../systems/RenderSystem";
import {FocusMarker} from "./FocusMarker";
import {
    appendWarningIconToFocus,
    calculateMaximumLength
} from "../../utils/elementsTools";
import * as d3 from '../../utils/d3Lib';


export class Focus extends Scene {

    MIN_PX_IN_ELEMENT = 2;
    MIN_PX_FOR_WARN_SIGN = this.MIN_PX_IN_ELEMENT * 5;
    markersData;
    maximalWidth;

    constructor(container) {
        super(container);
    }

    init({totalLength, minimalLength, maximalLength, data, contextWidth, maximalWidth}) {

        this.maximalWidth = maximalWidth;

        this._configureLength({
            minimalLength, maximalLength, contextWidth, totalLength
        });

        this._initYAxis();
        this._initBrush();
        this._setDefaultSelection();
        this._createMarkerClusters(data);
        this._initRenderFunction();

        this.render();
    }

    _initYAxis() {

        const endPosition = this.getTotalLength();

        this.yAxis = new YAxis({
            svg: this.svg,
            endPosition,
            startPosition: -this.MAIN_ELEMENT_SIZE,
            delta: 0
        });

        this.yAxis.appendYline(35);
    }

    _initBrush() {

        this.brushSystem = new BrushSystem({
            svg: this.svg,
            delta: 0,
            yConverter: this.yAxis.y,
            onBrush: ({selection, sourceEvent}) => {

                const {
                    convertedSelection,
                    selectionDifference
                } = this.brushSystem.getSelectionDifference(selection);


                if (this.checkSelectionValid(selectionDifference)) {

                    this.externalEvent && this.externalEvent(convertedSelection);
                    this.brushSystem.setCurrentSelection(convertedSelection);

                } else if (!sourceEvent) {
                    this.externalEvent && this.externalEvent(convertedSelection);
                    this.brushSystem.setCurrentSelection(convertedSelection);
                }

            },
            onBrushEnd: ({selection, sourceEvent}) => {
                if (!selection) {
                    this.brushSystem.moveBrushToDefault();
                } else if (sourceEvent) {
                    const {selectionDifference} = this.brushSystem.getSelectionDifference(selection);

                    if (!this.checkSelectionValid(selectionDifference)) {
                        this.brushSystem.moveBrush();
                    }
                }
                this.externalEvent && this.externalEvent();
            }
        });


        this.brushSystem.setWheelBoundariesSelection({
            min: this.MAIN_ELEMENT_SIZE,
            max: this.totalLength
        });
    }

    _setDefaultSelection() {

        const totalLength = this.getTotalLength();

        this.maxBrushSelection === 0 && (this.maxBrushSelection = totalLength + this.MAIN_ELEMENT_SIZE)

        totalLength < this.maxBrushSelection
            ? this.brushSystem.setDefaultSelection([-this.MAIN_ELEMENT_SIZE, totalLength])
            : this.brushSystem.setDefaultSelection([-this.MAIN_ELEMENT_SIZE, this.maxBrushSelection - this.MAIN_ELEMENT_SIZE]);

    }

    _createMarkerClusters(data) {

        const totalLength = this.getTotalLength();
        const clusters = [];
        const partsNumber = this._calculateElementsNumber(totalLength);
        const warnNumber = this._calculateWarnNumber(totalLength);

        if (data.length > warnNumber) {
            const warnStep = data.length / warnNumber;

            for (let i = 1; i <= warnNumber; i++) {

                let warningSignal = null;

                for (let j = Math.round(warnStep * (i - 1)) + 1; j < Math.round(warnStep * i); j++) {

                    const status = data[j].status;


                    if (status) {
                        warningSignal !== 'danger' && (warningSignal = status);
                    }
                }

                console.log(Math.round(warnStep * i))

                if (warningSignal) {
                    data[Math.round(warnStep * i)]
                        ? data[Math.round(warnStep * i)].calcStatus = warningSignal
                        : data[Math.round(warnStep * i) - 1].calcStatus = warningSignal
                }
            }
        }

        if (data.length > partsNumber) {

            const partStep = data.length / partsNumber;
            const partLength = totalLength / partsNumber;

            for (let i = 1; i <= partsNumber; i++) {
                const nextItem = Object.assign({}, data[Math.round(partStep * i)]);
                const itemsColor = [];

                let warningSignal = null;

                for (let j = Math.round(partStep * (i - 1)); j < Math.round(partStep * i); j++) {
                    const status = data[j].calcStatus;

                    itemsColor.push(data[j].color);

                    if (status) {
                        warningSignal = status;
                    }
                }

                const interpolatedColor = d3.interpolateRgb(...itemsColor)(0.5);

                nextItem.status = warningSignal;
                nextItem.color = interpolatedColor;
                nextItem.height = partLength;
                nextItem.position = partLength * (i - 1);

                clusters.push(nextItem);
            }

            this.markersData = clusters;
        } else {
            this.markersData = data;
        }

    }

    _initRenderFunction() {

        const renderSystem = new RenderSystem({
            y: this.yAxis.y,
            scene: this.scene,
            selector: 'd3-module-focus-marker'
        });

        const focus = this;

        renderSystem.initRenderFunctions({

            enter: (enter) => {

                enter.each(function (elementData) {

                    const svgGroup = d3.select(this).append('g');
                    svgGroup.attr('class', renderSystem.selector);

                    const drawElement = svgGroup.append('path');

                    drawElement.attr('d', d => {
                        return FocusMarker.createLinePath({
                            x: 42,
                            width: 10,
                            y: d.position,
                            length: d.height,
                            yConverter: renderSystem.y
                        });
                    })
                        .attr('fill', (d, index) => {
                            return d.color || getColor(index)
                        });

                    elementData.status && appendWarningIconToFocus({
                        element: d3.select('.d3-module-brush'),
                        status: elementData.status,
                        width: focus.width / 4,
                        x: (42) - (focus.width / 8),
                        y: focus.yAxis.y(elementData.position)
                    });

                });

            },
            update: (update) => {
                update.select('path')
                    .attr('d', d => {
                        return FocusMarker.createLinePath({
                            x: 42,
                            width: 10,
                            y: d.position,
                            length: d.height,
                            yConverter: renderSystem.y
                        });
                    })
                    .attr('fill', (d, index) => {
                        return d.color || getColor(index)
                    });
            }
        });

        this.render = () => renderSystem.renderElements(this.markersData);
    }


    resize(size, contextWidth) {
        this.yAxis.resize(size);
        this.brushSystem.resize(size);
        this.resizeHtmlAndSvg(size);

        const maximalLength = calculateMaximumLength({
            minimalLength: this.minBrushSelection,
            totalLength: this.getTotalLength(),
            height: size.height
        });

        this._configureLength({
            minimalLength: this.minBrushSelection, maximalLength, totalLength: this.getTotalLength(), contextWidth
        });

        this._createMarkerClusters(size.data)

        this._setDefaultSelection();
        this.updateBoundaries();

        this.brushSystem.setWheelBoundariesSelection({
            min: this.MAIN_ELEMENT_SIZE,
            max: this.totalLength
        });

        this.render()
    }

    _configureLength({minimalLength, maximalLength, totalLength}) {

        totalLength === 0 || totalLength < minimalLength
            ? this.setTotalLength(minimalLength + this.MAIN_ELEMENT_SIZE)
            : this.setTotalLength(totalLength)


        if (!maximalLength || maximalLength < minimalLength) {
            maximalLength = minimalLength
        }


        this.setMinMaxSelection({min: minimalLength, max: maximalLength});
    }

    _calculateElementsNumber(length) {
        const numberElementsInPx = this.height / length;
        const elementLength = this.MIN_PX_IN_ELEMENT / numberElementsInPx;
        return length / elementLength;
    }

    _calculateWarnNumber(length) {
        const numberElementsInPx = this.height / length;
        const warnLength = this.MIN_PX_FOR_WARN_SIGN / numberElementsInPx;
        return length / warnLength;
    }

    updateMarkersData({totalLength, minimalLength, maximalLength, data, maximalWidth, contextWidth}) {

        this.maximalWidth = maximalWidth;

        this._configureLength({
            minimalLength, maximalLength, totalLength, contextWidth
        });

        this.yAxis.update(this.getTotalLength(), -this.MAIN_ELEMENT_SIZE);
        this._setDefaultSelection();
        this._createMarkerClusters(data);
        this.updateBoundaries();

        this.brushSystem.setWheelBoundariesSelection({
            min: this.MAIN_ELEMENT_SIZE,
            max: this.totalLength
        });

        this.render();

        try {
            this.brushSystem.moveBrush();
        } catch (e) {
            this.brushSystem.moveBrushToDefault()
        }

    }

    updateColor(data) {
        this._createMarkerClusters(data)
        this.render();
    }

    changeFocusArea = (boundaries) => {
        this.brushSystem.moveBrush(boundaries);
    }

    checkSelectionValid(selectionDifference) {
        if (selectionDifference < this.minBrushSelection) {
            return false
        }

        return selectionDifference <= this.maxBrushSelection;
    }

    updateBoundaries() {
        this.totalLength < this.brushSystem.getCurrentSelection().map(this.yAxis.y.invert)[1] &&
        this.brushSystem.moveBrushToDefault()
    }
}