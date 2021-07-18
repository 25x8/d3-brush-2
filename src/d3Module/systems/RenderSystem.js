export class RenderSystem {
    y;
    scene;
    selector;

    constructor({y, scene, selector}) {
       this.y = y;
       this.scene = scene;
       this.selector = selector;
    }

    initRenderFunctions({enter, update}) {
        this.enterElements = enter;
        this.updateElements = update;
    }

    renderElements(data) {

        this.scene.selectAll(`.${this.selector}`)
            .data(data, d => d.id)
            .join(
                enter => this.enterElements(enter),
                update => this.updateElements(update),
                exit => exit.remove()
            )
    }


    enterElements(enter) {}

    updateElements(update) {}

}