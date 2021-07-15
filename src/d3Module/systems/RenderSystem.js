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

        // data = this.addMainElement(data);

        this.scene.selectAll(`.${this.selector}`)
            .data(data, d => d.id)
            .join(
                enter => this.enterElements(enter),
                update => this.updateElements(update),
                exit => exit.remove()
            )
    }

    addMainElement(data) {

        data.unshift({
            "id": "main-element",
            "status": null,
            "work": 0,
            "length": 50,
            "type": "main",
        });

        return data
    }

    enterElements(enter) {}

    updateElements(update) {}

}