import * as d3 from '../../utils/d3Lib'

export class FocusMarker {
    static createLinePath(x, y, length, yConverter) {

        const yConverted = yConverter(y);
        const lengthConverted = yConverter(y + length);

        return d3.line()([
            [x, yConverted],
            [x + (x / 4), yConverted],
            [x + (x / 4), lengthConverted],
            [x - (x / 4), lengthConverted],
            [x - (x / 4), yConverted],
            [x, yConverted]
        ])
    }
}
