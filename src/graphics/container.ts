import { mat4, vec3 } from "gl-matrix";
import { IPositionable } from "./i-positionable";
import { IRenderable } from "./i-renderable";
import { IRenderPipeline } from "./i-render-pipeline";
import { RenderablePrimitive } from "./renderable-primitive";
import { ShaderTarget } from "./shader-target";

export class Container extends ShaderTarget implements IRenderable, IPositionable {

    private _children: Array<Container | RenderablePrimitive> = [];
    private _globalMatrix: mat4;
    private _translation: vec3 = vec3.create();

    public get globalMatrix() {
        return mat4.clone(this._globalMatrix);
    }

    public set globalMatrix(value: mat4) {
        this._globalMatrix = value;
        mat4.getTranslation(this._translation, this._globalMatrix);
    }

    public get worldSpacePosition() {
        const pos: [number, number] = [
            this._translation[0],
            this._translation[1]
        ];
        return pos;
    }

    public get children() {
        return this._children.slice();
    }

    constructor(globalMatrix: mat4) {
        super();
        this._globalMatrix = globalMatrix;
    }

    public render(renderPipeline: IRenderPipeline) {

        const containerShaderCount = this._shaders.length;

        renderPipeline.openContainer(this.worldSpacePosition);

        for (const child of this._children) {
            const childShaderCount = child.getShaders().length;

            for (const shader of this._shaders) {
                child.addShader(shader);
            }

            child.render(renderPipeline);

            let shaderCount = childShaderCount + containerShaderCount;
            while (shaderCount > childShaderCount) {
                child.removeShaderAt(childShaderCount);
                shaderCount--;
            }
        }

        renderPipeline.closeContainer();
    }

    public addChild(child: Container | RenderablePrimitive) {
        this._children.push(child);
    }

    public removeChildAt(index: number) {
        const removed = this._children.splice(index, 1);
        return removed[0];
    }

}