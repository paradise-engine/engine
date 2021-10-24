import { Dictionary, createDictionaryProxy } from "../util";
import { BufferInfo, BufferInput, createBufferInfo, UniformData } from "../webgl";
import type { Renderer } from "./renderer";

const initialUniforms: Dictionary<UniformData> = {
    'u_resolution': [1.0, 1.0]
}

const BASE_POSITION = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1
];

const BASE_TEXCOORD = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1
];

const globalAttributes: BufferInput = {
    'a_position': {
        numComponents: 2,
        data: BASE_POSITION,
        type: Float32Array
    },
    'a_texcoord': {
        numComponents: 2,
        data: BASE_TEXCOORD,
        type: Float32Array
    }
}

Object.freeze(globalAttributes);

export type GlobalUniformsChangeHandler = (name: string, value: UniformData) => void;

export class GlobalShaderData {
    private _renderer: Renderer;

    private _onUniformsUpdate = (key: string, value: UniformData) => {
        for (const listener of this._uniformUpdateListeners) {
            listener(key, value);
        }
    }

    private _uniformUpdateListeners: GlobalUniformsChangeHandler[] = [];
    private _uniforms: Dictionary<UniformData> = createDictionaryProxy(this._onUniformsUpdate, initialUniforms);
    private _bufferInfo: BufferInfo;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._bufferInfo = createBufferInfo(this._renderer.context, globalAttributes);
    }

    public addUpdateListener(listener: GlobalUniformsChangeHandler) {
        this._uniformUpdateListeners.push(listener);
    }

    public removeUpdateListener(listener: GlobalUniformsChangeHandler) {
        const listenerIndex = this._uniformUpdateListeners.indexOf(listener);
        if (listenerIndex !== -1) {
            this._uniformUpdateListeners.splice(listenerIndex, 1);
        }
    }

    public getUniform(name: string): UniformData | undefined {
        return this._uniforms[name];
    }

    public setUniform(name: string, value: UniformData) {
        this._uniforms[name] = value;
    }

    public get uniforms() {
        return this._uniforms;
    }

    public get bufferInfo() {
        return this._bufferInfo;
    }
}
