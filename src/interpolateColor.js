function Interpolate(start, end, steps, count) {
    let s = start;
    let final = s + (((end - s) / steps) * count);

    return Math.floor(final);
}
function Color(_r, _g, _b) {
    let r, g, b;
    let setColors = function(_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function() {
        return {
            r: r,
            g: g,
            b: b
        };
    };
}

function getColor(val) {
    if (val === 0 ) return "rgb(196,196,196)";

    const red = new Color(235, 42, 61);
    const yellow = new Color(251, 150, 120);
    const gray = new Color(196, 196, 196);
    let start = gray,
        end = yellow;

    if (val > 50) {
        start = yellow;
        end = red;
        val = val % 51;
    }
    const startColors = start.getColors();
    const endColors = end.getColors();
    const r = Interpolate(startColors.r, endColors.r, 50, val);
    const g = Interpolate(startColors.g, endColors.g, 50, val);
    const b = Interpolate(startColors.b, endColors.b, 50, val);

    return `rgb(${r},${g},${b})`;
}

function getColorFromMax(val) {
    const stepColors = {
        0 : new Color(105,167,54),
        10 : new Color(210,207,61),
        30 : new Color(238,143,39),
        50 : new Color(238,62,39),
        80 : new Color(161,18,18),
        100: new Color(80,10,10)
    };
    if (val === 0 ) {
        return "rgb(105,167,54)";
    } else if (val > 100) {
        return "rgb(80,10,10)";
    }

    const steps = Object.keys(stepColors);

    let start = steps[0],
        end = steps[steps.length-1];

    steps.some((step, i) => {
        if (i === steps.length-2) return true;

        const next = steps[i+1];
        if (step <= val && val <= next ) {
            start = step;
            end = next;
            return true
        } else {
            start = next;
        }
    });

    const countSteps = end - start;

    val = val - start;

    let startColors = stepColors[start].getColors(),
        endColors = stepColors[end].getColors();
    let r = Interpolate(startColors.r, endColors.r, countSteps, val);
    let g = Interpolate(startColors.g, endColors.g, countSteps, val);
    let b = Interpolate(startColors.b, endColors.b, countSteps, val);

    return `rgb(${r},${g},${b})`;

}

export {getColor, getColorFromMax};