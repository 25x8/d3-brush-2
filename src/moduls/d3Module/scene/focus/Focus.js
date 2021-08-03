import {Scene} from "../Scene";
import {BrushSystem} from "../../systems/BrushSystem";
import {YAxis} from "../../systems/yAxis";
import {getColor} from "../../../interpolateColor";
import {RenderSystem} from "../../systems/RenderSystem";
import {FocusMarker} from "./FocusMarker";
import {appendWarningIconToDrawingElement, calculateMaximumLength} from "../../utils/elementsTools";
import * as d3 from '../../utils/d3Lib';

export class Focus extends Scene {

    PARTS_NUMBER = 20;
    MIN_PX_IN_ELEMENT = 10;
    markersData;

    constructor(container) {
        super(container);
    }

    init({totalLength, minimalLength, maximalLength, data, contextWidth}) {

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
            delta: 10
        });

        this.yAxis.appendYline(35);
    }

    _initBrush() {

        this.brushSystem = new BrushSystem({
            svg: this.svg,
            delta: 10,
            yConverter: this.yAxis.y,
            onBrush: ({selection}) => {


                const {
                    convertedSelection,
                    selectionDifference
                } = this.brushSystem.getSelectionDifference(selection);


                if (this.checkSelectionValid(selectionDifference)) {

                    this.externalEvent && this.externalEvent(convertedSelection);
                    this.brushSystem.setCurrentSelection(convertedSelection);
                }

            },
            onBrushEnd: ({selection}) => {
                if (!selection) {
                    this.brushSystem.moveBrushToDefault();

                } else {

                    const {selectionDifference} = this.brushSystem.getSelectionDifference(selection);

                    if (!this.checkSelectionValid(selectionDifference)) {
                        this.brushSystem.moveBrush();
                    }
                }
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

        if (data.length > partsNumber) {

            const partStep = data.length / partsNumber;
            const partLength = totalLength / partsNumber;

            for (let i = 1; i <= partsNumber; i++) {

                const nextItem = Object.assign({}, data[Math.round(partStep * i)]);

                const itemsColor = [];

                let warningSignal = null;

                for (let j = Math.round(partStep * (i - 1)) + 1; j < Math.round(partStep * i); j++) {
                    const status = data[j].status;

                    itemsColor.push(data[j].color);

                    if (status) {
                        warningSignal !== 'danger' && (warningSignal = status);
                    }
                }

                const interpolatedColor = d3.interpolateRgb(...itemsColor)(0.5);

                warningSignal && (nextItem.status = warningSignal);
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
                        .attr('stroke', '#b47e94')
                        .attr('fill', (d, index) => {
                            return d.color || getColor(index)
                        });

                    elementData.status && appendWarningIconToDrawingElement({
                        element: svgGroup,
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


    resize(size) {
        this.yAxis.resize(size);
        this.brushSystem.resize(size);
        this.resizeHtmlAndSvg(size);

        const maximalLength = calculateMaximumLength({
            minimalLength: this.minBrushSelection,
            totalLength: this.getTotalLength(),
            height: size.height
        });

        this._configureLength({
            minimalLength: this.minBrushSelection, maximalLength, totalLength: this.getTotalLength()
        });

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

    _calculateMinimalZoom({contextWidth, mainElementWidth}) {
        const minZoomRation = 10 / (contextWidth / mainElementWidth);
        return mainElementWidth * minZoomRation;
    }

    updateMarkersData({totalLength, minimalLength, maximalLength, data}) {

        this._configureLength({
            minimalLength, maximalLength, totalLength
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

        selectionDifference = Math.round(selectionDifference);

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