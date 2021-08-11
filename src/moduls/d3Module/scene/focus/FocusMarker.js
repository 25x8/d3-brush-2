import * as d3 from '../../utils/d3Lib'

export class FocusMarker {
    static createLinePath({x, y, width, length, yConverter}) {

        const yConverted = yConverter(y);
        const lengthConverted = yConverter(y + length);

        return d3.line()([
            [x, yConverted],
            [x + (width / 2), yConverted],
            [x + (width / 2), lengthConverted],
            [x - (width / 2), lengthConverted],
            [x - (width / 2), yConverted],
            [x, yConverted]
        ])
    }
}
