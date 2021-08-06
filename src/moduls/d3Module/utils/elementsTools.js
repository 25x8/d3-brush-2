import warningSign from '../../../img/icons/warning.svg';
import dangerSign from '../../../img/icons/alarm.svg';

const MIN_PX = 10;
const START_MIN = Number.MAX_SAFE_INTEGER;


export function createHTMLElement({name, width, height}) {
    const el = document.createElement('div');
    el.setAttribute('id', name);
    width && (el.style.width = `${width}px`)
    height && (el.style.height = `${height}px`);
    return el;
}

export function calculateElementsPosition({data, height}) {

    let totalLength = 0;
    let minimalLength = START_MIN;

    const dataWithCalculatedPosition = data.map(el => {


        el.position = totalLength;
        el.height < minimalLength && (minimalLength = el.height)

        totalLength += el.height;

        return Object.assign({}, el);
    });



    minimalLength === START_MIN && (minimalLength = 0);
    const maximalLength = calculateMaximumLength({minimalLength, totalLength, height});

    return {
        minimalLength,
        maximalLength,
        totalLength,
        data: dataWithCalculatedPosition
    }
}

export function appendAllElementsToContainer({elements, container}) {
    Array.isArray(elements)
        ? elements.forEach(el => container.appendChild(el))
        : container.appendChild(elements)
}

export function calculateMaximumLength({minimalLength, totalLength, height}) {
    console.log(minimalLength)
    if(minimalLength === 0 ) {
        return  0
    }

    minimalLength < 1 && (minimalLength = Math.floor(1 / minimalLength));

    totalLength === 0 && (totalLength = 1);

    const pxInMeter = totalLength / height;
    const metersInMinPxs = pxInMeter * MIN_PX;
    const elementsInMinPxs = metersInMinPxs / minimalLength;

    // max visible length
    return  totalLength / elementsInMinPxs;
}

export function appendWarningIcon({element, status}){
    const icon = element.select('image');
    icon.node() && icon.remove();

    element.append('image')
        .attr('href', status === "danger" ? dangerSign : warningSign )
        .attr('height', 300)
        .attr('x',  -70)
        .attr('y', 130);
}

export function appendWarningIconToDrawingElement({element, status, width, y, x}) {
    const icon = element.select('image');
    icon.node() && icon.remove();

    element.append('image')
        .attr('href', status === "danger" ? dangerSign : warningSign )
        .attr('width', width)
        .attr('x', x)
        .attr('y', y);
}

export function appendWarningIconToFocus({element, status, width, y, x}) {
    element.append('image')
        .attr('href', status === "danger" ? dangerSign : warningSign )
        .attr('width', width)
        .attr('x', x)
        .attr('y', y);
}
