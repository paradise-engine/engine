import { Rotation, Vector } from "../core";
import { RenderablePrimitive } from "./renderable-primitive";
import { Renderer } from "./renderer";
import { Texture } from "./texture";

export class Sprite extends RenderablePrimitive {
    public texture: Texture;

    constructor(texture: Texture) {
        super(
            new Vector(0, 0),
            Rotation.fromDegrees(0),
            new Vector(1, 1)
        );
        this.texture = texture;
    }

    render(renderer: Renderer) {
        const textureToRender = renderer.shaderPipeline.applyShaders(this.texture.baseTexture, this.getShaders());

    }
}