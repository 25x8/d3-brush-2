import warningSign from '../../../img/icons/warning.svg';
import dangerSign from '../../../img/icons/alarm.svg';

const MIN_PX = 10;


export function createHTMLElement({name, width, height}) {
    const el = document.createElement('div');
    el.setAttribute('id', name);
    width && (el.style.width = `${width}px`)
    height && (el.style.height = `${height}px`);
    return el;
}

export function calculateElementsPosition({data, height}) {

    let totalLength = 0;
    let minimalLength = 100000;

    const dataWithCalculatedPosition = data.map(el => {

        el.position = totalLength;
        el.height < minimalLength && (minimalLength = el.height)

        totalLength += el.height;

        return Object.assign({}, el);
    });

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

    minimalLength < 1 && (minimalLength = Math.floor(1 / minimalLength));

    const pxInMeter = totalLength / height;
    const metersInMinPxs = pxInMeter * MIN_PX;
    const elementsInMinPxs = metersInMinPxs / minimalLength;

    // max visible length
    return  totalLength / elementsInMinPxs;
}

export function appendWarningIcon({element, status}){
    element.select('image').remove();

    element.append('image')
        .attr('href', status === "danger" ? dangerSign : warningSign )
        .attr('height', 300)
        .attr('x',  -70)
        .attr('y', 130);
}

export function appendWarningIconToDrawingElement({element, status, width, y, x}) {
    element.select('image').remove();


    element.append('image')
        .attr('href', status === "danger" ? dangerSign : warningSign )
        .attr('height', width)
        .attr('x', x)
        .attr('y', y);
}
