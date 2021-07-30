import {Scene} from "../Scene";
import {BrushSystem} from "../../systems/BrushSystem";
import {YAxis} from "../../systems/yAxis";
import {getColor} from "../../../interpolateColor";
import {RenderSystem} from "../../systems/RenderSystem";
import {FocusMarker} from "./FocusMarker";
import {appendWarningIconToDrawingElement} from "../../utils/elementsTools";
import * as d3 from '../../utils/d3Lib';

export class Focus extends Scene {

    PARTS_NUMBER = 20;
    markersData;

    constructor(container) {
        super(container);
    }

    init({totalLength, minimalLength, maximalLength, data, contextWidth}) {

        this.#configureLength({
            minimalLength, maximalLength, contextWidth, totalLength
        });

        this.#initYAxis();
        this.#initBrush();
        this.#setDefaultSelection();
        this.#createMarkerClusters(data);
        this.#initRenderFunction();

        this.render();
    }

    #initYAxis() {

        const endPosition = this.getTotalLength();

        this.yAxis = new YAxis({
            svg: this.svg,
            endPosition,
            startPosition: -this.MAIN_ELEMENT_SIZE,
            delta: 10
        });

        this.yAxis.appendYline(this.width);
    }

    #initBrush() {

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

    #setDefaultSelection() {

        const totalLength = this.getTotalLength();

        totalLength < this.maxBrushSelection
            ? this.brushSystem.setDefaultSelection([-this.MAIN_ELEMENT_SIZE, totalLength])
            : this.brushSystem.setDefaultSelection([-this.MAIN_ELEMENT_SIZE, this.maxBrushSelection - this.MAIN_ELEMENT_SIZE]);
    }

    #createMarkerClusters(data) {

        const totalLength = this.getTotalLength();
        const clusters = [];

        if (data.length > this.PARTS_NUMBER) {

            const partStep = data.length / this.PARTS_NUMBER;
            const partLength = totalLength / this.PARTS_NUMBER;

            for (let i = 1; i <= this.PARTS_NUMBER; i++) {

                const nextItem = Object.assign({}, data[Math.round(partStep * i)]);

                let warningSignal = null;

                for (let j = Math.round(partStep * (i - 1)) + 1; j < Math.round(partStep * i); j++) {
                    const status = data[j].status;
                    if (status) {
                        warningSignal !== 'danger' && (warningSignal = status);
                    }
                }

                warningSignal && (nextItem.status = warningSignal);
                nextItem.height = partLength;
                nextItem.position = partLength * (i - 1);

                clusters.push(nextItem);
            }

            this.markersData = clusters;
        } else {
            this.markersData = data;
        }

    }

    #initRenderFunction() {

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
                            x: 25,
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
                        width: elementData.height,
                        x: (focus.width / 4) + 5,
                        y: focus.yAxis.y(elementData.position)
                    });

                });

            },
            update: (update) => {
                update.select('path')
                    .attr('d', d => {
                        return FocusMarker.createLinePath({
                            x: 25,
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

    #configureLength({minimalLength, maximalLength, contextWidth, totalLength}) {

        minimalLength = this.#getMinimalLength({minimalLength, contextWidth});

        totalLength === 0 || totalLength < minimalLength
            ? this.setTotalLength(minimalLength + this.MAIN_ELEMENT_SIZE)
            : this.setTotalLength(totalLength)


        if(!maximalLength || maximalLength < minimalLength) {
            maximalLength = minimalLength
        }

        this.setMinMaxSelection({min: minimalLength, max: maximalLength});

    }

    #getMinimalLength({minimalLength, contextWidth}) {

        if (minimalLength < this.MAIN_ELEMENT_SIZE) {

            minimalLength = this.#calculateMinimalZoom({
                contextWidth,
                mainElementWidth: this.MAIN_ELEMENT_SIZE
            });
        }
        return minimalLength;
    }

    #calculateMinimalZoom({contextWidth, mainElementWidth}) {
        const minZoomRation = 1 - mainElementWidth / contextWidth;
        return mainElementWidth * minZoomRation * 10;
    }

    updateMarkersData({totalLength, minimalLength, maximalLength, data, contextWidth}) {

        this.#configureLength({
            minimalLength, maximalLength, contextWidth, totalLength
        });

        this.yAxis.update(this.getTotalLength(), -this.MAIN_ELEMENT_SIZE);
        this.#setDefaultSelection();
        this.#createMarkerClusters(data);
        this.updateBoundaries();

        this.brushSystem.setWheelBoundariesSelection({
            min: this.MAIN_ELEMENT_SIZE,
            max: this.totalLength
        });

        this.render();
        this.brushSystem.moveBrush();

    }

    updateColor({index, color}) {
        const element = this.markersData[index];
        element.color = color;
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