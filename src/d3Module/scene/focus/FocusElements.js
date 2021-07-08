import {FocusMarker} from "./FocusMarker";
import {getColor} from "../../../interpolateColor";

export function renderElements({scene, data}) {
    scene.selectAll('.d3-module-focus-marker')
        .data(data, d => d.id)
        .join(
            enter => appendElements(enter),
            update => updateElements(update),
            exit => exit.remove()
        )
}

function appendElements(enter) {
    const g = enter.append('g')
        .attr('class', 'd3-module-focus-marker');

    g.append('path')
        .attr('d', d => {
            return FocusMarker.createLinePath(25, d.position, d.height, this.yAxis.y);
        })
        .attr('stroke', '#b47e94')
        .attr('fill', (d, index) => getColor(index));
}

function updateElements(update) {
    update.select('path')
        .attr('d', d => {
            return FocusMarker.createLinePath(25, d.position, d.height, this.yAxis.y);
        });
}