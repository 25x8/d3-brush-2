import * as d3 from 'd3-shape';

export const drawRectangle = ({x, y, width, height}) => {
    const line = d3.line();

    return line([
        [x, y],
        [x + (height / 2), y],
        [x + (height / 2), y + width],
        [x - (height / 2), y + width],
        [x - (height / 2), y],
        [x, y]
    ])
}