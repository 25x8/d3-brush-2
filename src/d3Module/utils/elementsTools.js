export function createHTMLElement({name, width, height}) {
    const el = document.createElement('div');
    el.setAttribute('id', name);
    width && (el.style.width = `${width}px`)
    height && (el.style.height = `${height}px`);
    return el;
}

export function calculateElementsPosition(data) {
    let totalLength = 0;
    const dataWithCalculatedPosition = data.map(el => {
        el.position = totalLength;
        totalLength += el.height;
        return el;
    });

    return {
        totalLength,
        data: dataWithCalculatedPosition
    }
}

export function appendAllElementsToContainer({elements, container}) {
    Array.isArray(elements)
        ? elements.forEach(el => container.appendChild(el))
        : container.appendChild(elements)
}