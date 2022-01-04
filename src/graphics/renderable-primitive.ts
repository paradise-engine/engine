import { IRenderable } from "./i-renderable";
import { mat4, quat, vec3 } from "gl-matrix";
import { ShaderTarget } from "./shader-target";
import { IPositionable } from "./i-positionable";
import { IRenderPipeline } from "./i-render-pipeline";

export abstract class RenderablePrimitive extends ShaderTarget implements IRenderable, IPositionable {
    private _globalMatrix: mat4;
    private _translation: vec3 = vec3.create();
    private _rotation: quat = quat.create();
    private _scaling: vec3 = vec3.create();

    public get globalMatrix() {
        return mat4.clone(this._globalMatrix);
    }

    public set globalMatrix(value: mat4) {
        this._globalMatrix = value;
        this._updateTransforms();
    }

    public get x() {
        return this._translation[0];
    }

    public get y() {
        return this._translation[1];
    }

    public get scaleX() {
        return this._scaling[0];
    }

    public get scaleY() {
        return this._scaling[1];
    }

    public get rotationZ() {
        return this._rotation[2];
    }

    public get worldSpacePosition() {
        const pos: [number, number] = [
            this._translation[0],
            this._translation[1]
        ];
        return pos;
    }

    constructor(globalMatrix: mat4) {
        super();
        this._globalMatrix = globalMatrix;
    }

    private _updateTransforms() {
        mat4.getTranslation(this._translation, this._globalMatrix);
        mat4.getRotation(this._rotation, this._globalMatrix);
        mat4.getScaling(this._scaling, this._globalMatrix);
    }

    public abstract render(renderPipeline: IRenderPipeline): void;
}