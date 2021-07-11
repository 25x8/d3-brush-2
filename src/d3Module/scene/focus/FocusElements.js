import {FocusMarker} from "./FocusMarker";
import {getColor} from "../../../interpolateColor";

export function renderElements({scene, data, y}) {


    scene.selectAll('.d3-module-focus-marker')
        .data(data, d => d.id)
        .join(
            enter => appendElements(enter, y),
            update => updateElements(update, y),
            exit => exit.remove()
        )
}

function appendElements(enter, y) {
    const g = enter.append('g')
        .attr('class', 'd3-module-focus-marker');

    g.append('path')
        .attr('d', d => {
            return FocusMarker.createLinePath(25, d.position, d.height, y);
        })
        .attr('stroke', '#b47e94')
        .attr('fill', (d, index) => getColor(index));
}

function updateElements(update, y) {
    update.select('path')
        .attr('d', d => {
            return FocusMarker.createLinePath(25, d.position, d.height, y);
        });
}