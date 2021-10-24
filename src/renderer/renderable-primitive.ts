import { Rotation, Vector } from "../core";
import { Shader } from "../webgl";
import { IRenderable } from "./i-renderable";
import { Renderer } from "./renderer";

export abstract class RenderablePrimitive implements IRenderable {
    protected _shaders: Shader[] = [];

    public position: Vector;
    public rotation: Rotation;
    public scale: Vector;

    constructor(position: Vector, rotation: Rotation, scale: Vector) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    public abstract render(renderer: Renderer): void;

    public getShaders() {
        return this._shaders.concat();
    }

    public addShader(shader: Shader) {
        this._shaders.push(shader);
    }

    public removeShaderAt(index: number) {
        this._shaders.splice(index, 1);
    }
}