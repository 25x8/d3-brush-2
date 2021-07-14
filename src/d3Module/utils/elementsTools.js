const MIN_PX = 10;

export function createHTMLElement({name, width, height}) {
    const el = document.createElement('div');
    el.setAttribute('id', name);
    width && (el.style.width = `${width}px`)
    height && (el.style.height = `${height}px`);
    return el;
}

export function calculateElementsPosition(data) {

    let totalLength = 0;
    let minimalLength = 100000;

    const dataWithCalculatedPosition = data.map(el => {

        el.position = totalLength;
        el.height < minimalLength && (minimalLength = el.height)

        totalLength += el.height;

        return Object.assign({}, el);
    });

    const maximalLength = calculateMaximumLength({minimalLength, totalLength});

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

function calculateMaximumLength({minimalLength, totalLength}) {
    const numberElementsInMinPx = MIN_PX / minimalLength;
    const maxVisibleLength = totalLength / MIN_PX;

    console.log('numberElementsInMinPx', numberElementsInMinPx)
    console.log('maxVisibleLength', maxVisibleLength)
   return  maxVisibleLength / (MIN_PX * numberElementsInMinPx);

}