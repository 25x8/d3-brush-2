export default class Tooltip {

    container;
    currentWidth;
    currentHeight;
    delta = 20;
    lastElement;

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

    setContent = ({content, element}) => {

        this.container.innerHTML = content;
        this.removeHoverColor();
        this.setHoverColor(element);

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

    removeHoverColor() {
        this.lastElement && (this.lastElement.hovered = false);
    }

    setHoverColor(element) {
        element && (element.hovered = true);
        this.lastElement = element;
    }

}