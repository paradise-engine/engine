import { mat4 } from "gl-matrix";
import { IRenderable } from "./i-renderable";
import { Renderer } from "./renderer";
import { Texture } from "./texture";

export class Sprite implements IRenderable {

    private _texture?: Texture;

    public get texture() {
        return this._texture;
    }

    constructor(texture?: Texture) {
        this._texture = texture;
    }

    render(renderer: Renderer) {
        if (!this.texture) {
            throw new Error('Cannot render: No texture');
        }
    }

}