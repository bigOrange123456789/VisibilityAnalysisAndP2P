

export class AntiAliasing {
    constructor(camera, scene, renderer) {
        this.camera = camera
        this.scene = scene
        this.composer = this.initComposer0(renderer)
    }
}