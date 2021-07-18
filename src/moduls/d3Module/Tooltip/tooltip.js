export default class Tooltip {

    container;
    currentWidth;
    currentHeight;
    delta = 20;
    margin = 210;

    constructor(selector) {
        this.container = document.querySelector(selector);
    }

    show = () => {
        this.container.style.display = 'block';
    }

    hide = () => {
        this.container.style.display = 'none';
    }

    setPosition = (x, y) => {
        x = this.leftRightCollisions(x);
        y = this.topCollision(y);

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