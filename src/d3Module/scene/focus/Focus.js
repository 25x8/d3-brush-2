import {Scene} from "../Scene";
import {BrushSystem} from "../../systems/BrushSystem";
import {YAxis} from "../../systems/yAxis";
import {renderElements} from "./FocusElements";
import {getColor} from "../../../interpolateColor";

export class Focus extends Scene {

    PARTS_NUMBER = 20;
    markersData;

    constructor(container) {
        super(container);
    }

    init({totalLength, data}) {
        this.#initYAxis(totalLength);
        this.#initBrush(totalLength);
        this.#createMarkerClusters(data, totalLength);

        renderElements({
            scene: this.scene,
            data: this.markersData,
            y: this.yAxis.y
        });
    }

    resize({width, height}) {
        this.yAxis.resize({height, delta: 10});
        this.brushSystem.resize({width, height, delta: 10});
        this.resizeScene({width, height});
        renderElements({
            scene: this.scene,
            markersData: this.markersData,
            y: this.yAxis.y
        });
    }

    updateMarkersData({totalLength, data}) {
        this.yAxis.update(totalLength);
        this.#createMarkerClusters(data, totalLength);
        renderElements({
            scene: this.scene,
            markersData: this.markersData,
            y: this.yAxis.y
        });
    }


    #initYAxis(endLength) {
        this.yAxis = new YAxis({
            svg: this.svg,
            endLength,
            delta: 10
        });

        this.yAxis.appendYline(this.width);
    }

    #initBrush(startSelection) {
        this.brushSystem = new BrushSystem({
            svg: this.svg,
            delta: 10,
            onBrush: this.#onBrush,
            onBrushEnd: this.#onBrushEnded
        })

        this.brushSystem.yConverter = this.yAxis.y;
        this.brushSystem.setDefaultSelection(0, startSelection)
    }

    #onBrush = (e) => {
      this.externalEvent && this.externalEvent(e.selection.map(this.yAxis.y.invert));
    }

    #onBrushEnded = ({selection}) => {
        if (!selection) {
            this.brushSystem.brush.call(this.brushSystem.brushArea.move, this.brushSystem.defaultSelection);
        }
    }

    #createMarkerClusters(data, totalLength) {

        const clusters = [];

        if (data.length > this.PARTS_NUMBER) {
            const partStep = data.length   / this.PARTS_NUMBER;
            const partLength = totalLength / this.PARTS_NUMBER;
            for (let i = 0; i < this.PARTS_NUMBER; i++) {
                const nextItem = data[Math.round(partStep * i)];
                nextItem.height = partLength ;
                nextItem.position = partLength * i ;
                clusters.push(nextItem);
            }
            this.markersData = clusters;
        } else {
            this.markersData = data;
        }
    }
}