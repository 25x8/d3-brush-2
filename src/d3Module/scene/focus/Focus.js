import {Scene} from "../Scene";
import {BrushSystem} from "../../systems/BrushSystem";
import {YAxis} from "../../systems/yAxis";
import {getColor} from "../../../interpolateColor";
import {RenderSystem} from "../../systems/RenderSystem";
import {FocusMarker} from "./FocusMarker";

export class Focus extends Scene {

    PARTS_NUMBER = 20;
    markersData;

    constructor(container) {
        super(container);
    }

    init({totalLength, minimalLength, maximalLength, data}) {

        this.#initYAxis(totalLength);
        this.#initBrush(totalLength);
        this.#createMarkerClusters(data, totalLength);
        this.#initRenderFunction();
        this.setMinMaxSelection({min: minimalLength, max: maximalLength});
        this.render();
    }

    #initYAxis(endPosition) {

        this.yAxis = new YAxis({
            svg: this.svg,
            endPosition,
            delta: 10
        });

        this.yAxis.appendYline(this.width);
    }

    #initBrush(startSelection) {

        this.brushSystem = new BrushSystem({
            svg: this.svg,
            delta: 10,
            yConverter: this.yAxis.y,
            onBrush: ({selection}) => {

                const {
                    convertedSelection,
                    selectionDifference
                } = this.brushSystem.getSelectionDifference(selection);


                if (selectionDifference > this.minBrushSelection) {

                    this.externalEvent && this.externalEvent(convertedSelection);
                    this.brushSystem.setCurrentSelection(convertedSelection);
                }

            },
            onBrushEnd: ({selection}) => {

                if (!selection) {
                    this.brushSystem.moveBrushToDefault();
                } else {

                    const {selectionDifference} = this.brushSystem.getSelectionDifference(selection);

                    if (selectionDifference < this.minBrushSelection) {
                        this.brushSystem.moveBrush();
                    }
                }
            }
        });

        this.brushSystem.setDefaultSelection([0, startSelection])
    }

    #createMarkerClusters(data, totalLength) {

        const clusters = [];

        if (data.length > this.PARTS_NUMBER) {

            const partStep = data.length / this.PARTS_NUMBER;
            const partLength = totalLength / this.PARTS_NUMBER;

            for (let i = 0; i < this.PARTS_NUMBER; i++) {

                const nextItem = Object.assign({}, data[Math.round(partStep * i)]);

                nextItem.height = partLength;
                nextItem.position = partLength * i;

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

        renderSystem.initRenderFunctions({

            enter: (enter) => {
                const g = enter.append('g')
                    .attr('class', renderSystem.selector);

                g.append('path')
                    .attr('d', d => {
                        return FocusMarker.createLinePath(25, d.position, d.height, renderSystem.y);
                    })
                    .attr('stroke', '#b47e94')
                    .attr('fill', (d, index) => getColor(index));

            },
            update: (update) => {
                update.select('path')
                    .attr('d', d => {
                        return FocusMarker.createLinePath(25, d.position, d.height, renderSystem.y);
                    });
            }
        });

        this.render = () => renderSystem.renderElements(this.markersData);
    }


    updateMarkersData({totalLength, minimalLength, data}) {

        this.yAxis.update(totalLength);
        this.#createMarkerClusters(data, totalLength);
        this.setMinMaxSelection({min: minimalLength});
        this.render();
        this.brushSystem.moveBrush();
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


}