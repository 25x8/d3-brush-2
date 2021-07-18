export default class Tooltip {

    container;
    currentWidth;
    currentHeight;
    delta = 20;
    margin = 210;

    constructor(selector) {
        const container = document.querySelector(selector);
        this.container = container;
        const focusRect = document.querySelector('#focus').getBoundingClientRect()
        this.margin = focusRect.y;

    }

    show = () => {
        this.container.style.display = 'block';
    }

    hide = () => {
        this.container.style.display = 'none';
    }

    setPosition = (x, y) => {
        this.container.style.transform = `translate(${x}px, ${y}px)`;
    }

    setContent = (content) => {
        this.container.innerHTML = content;

        const  { width, height } = this.container.getBoundingClientRect();

        this.currentHeight = height;
        this.currentWidth = width;
    }

    leftRightCollisions = (offsetX) => {

        return  (offsetX ) + this.delta;
    }

    topCollision = (offsetY) => {
        return  offsetY - this.currentHeight

    }

}