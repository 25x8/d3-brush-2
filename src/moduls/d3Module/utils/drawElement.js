import * as d3 from 'd3-shape';

export const drawRectangle = ({x, y, width, height}) => {
    const line = d3.line();

    return line([
        [x, y],
        [x + (width / 2), y],
        [x + (width / 2), y + height],
        [x - (width / 2), y + height],
        [x - (width / 2), y],
        [x, y]
    ])
}