import { createDictionaryProxy, Dictionary } from "../../util";
import { AttributeSetters, createAttributeSetters } from "./attribute-setters";
import { BufferInfo } from "./buffer-info";
import { createShaderProgram } from "./create-shader-program";
import { setAttributes } from "./set-attributes";
import { setUniforms } from "./set-uniforms";
import { createUniformSetters, UniformData, UniformSetters } from "./uniform-setters";

export interface ShaderInternals {
    vertexSource: string;
    fragmentSource: string;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
}

export enum ShaderState {
    Inactive = 0, // don't apply
    Dirty = 1, // re-set values & apply
    Pristine = 2 // re-use & apply
}

export class Shader {

    protected _gl: WebGLRenderingContext;

    protected _internals: ShaderInternals;
    protected _program: WebGLProgram;
    protected _attributeSetters: AttributeSetters;
    protected _uniformSetters: UniformSetters;
    protected _state: ShaderState;
    protected _isActive: boolean;
    protected _bufferInfo: BufferInfo;

    public get internals() {
        return this._internals;
    }

    public get program() {
        return this._program;
    }

    public get state() {
        return this._state;
    }

    public get isActive() {
        return this._isActive;
    }

    public get bufferInfo() {
        return this._bufferInfo;
    }

    public readonly uniforms: Dictionary<UniformData>;

    protected onUniformUpdate = () => {
        if (this._isActive) {
            this._state = ShaderState.Dirty;
        }
    }

    constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string, bufferInfo: BufferInfo) {
        this._gl = gl;

        const { program, vertexShader, fragmentShader } = createShaderProgram(gl, vertexSource, fragmentSource);
        this._internals = {
            vertexSource,
            fragmentSource,
            vertexShader,
            fragmentShader
        }
        this._program = program;

        this._attributeSetters = createAttributeSetters(gl, program);
        this._uniformSetters = createUniformSetters(gl, program);
        this._state = ShaderState.Dirty;
        this._isActive = true;

        this.uniforms = createDictionaryProxy<UniformData>(this.onUniformUpdate);
        this._bufferInfo = bufferInfo;
    }

    public deactivate() {
        this._isActive = false;
        this._state = ShaderState.Inactive;
    }

    public activate() {
        if (!this._isActive) {
            this._isActive = true;
            this._state = ShaderState.Dirty;
        }
    }

    public setPristine() {
        if (this._isActive) {
            this._state = ShaderState.Pristine;
        }
    }

    public updateAttributes(data?: BufferInfo) {
        setAttributes(this._gl, this._attributeSetters, data || this.bufferInfo);
    }

    public updateUniforms(...data: Dictionary<UniformData>[]) {
        setUniforms(this._uniformSetters, ...data);
    }
}