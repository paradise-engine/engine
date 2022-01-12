import { Shader } from "./shader";

/**
 * Base class for all objects that can be target to
 * shading.
 */
export abstract class ShaderTarget {
    protected _shaders: Shader[] = [];

    public getShaders() {
        return this._shaders.slice();
    }

    public addShader(shader: Shader) {
        this._shaders.push(shader);
    }

    public removeShaderAt(index: number) {
        this._shaders.splice(index, 1);
    }
}