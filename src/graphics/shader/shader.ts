import { createDictionaryProxy, Dictionary } from "../../util";
import { IRenderContext } from "../i-render-context";
import { AttributeSetters, BufferInfo, NativeShader, NativeShaderProgram, UniformData, UniformSetters } from "../types";

export interface ShaderInternals {
    vertexSource: string;
    fragmentSource: string;
    vertexShader: NativeShader;
    fragmentShader: NativeShader;
}

export enum ShaderState {
    Inactive = 0, // don't apply
    Dirty = 1, // re-set values & apply
    Pristine = 2 // re-use & apply
}

export class Shader {

    protected _context: IRenderContext;

    protected _program: NativeShaderProgram;
    protected _internals: ShaderInternals;
    protected _state: ShaderState;
    protected _isActive: boolean;
    protected _bufferInfo: BufferInfo;
    protected _attributeSetters: AttributeSetters;
    protected _uniformSetters: UniformSetters;

    public get program() {
        return this._program;
    }

    public get internals() {
        return this._internals;
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

    constructor(context: IRenderContext, vertexSource: string, fragmentSource: string, bufferInfo: BufferInfo) {
        this._context = context;

        const { program, vertexShader, fragmentShader } = context.createShaderProgram(vertexSource, fragmentSource);
        this._internals = {
            vertexSource,
            fragmentSource,
            vertexShader,
            fragmentShader
        }
        this._program = program;

        this._attributeSetters = context.createAttributeSetters(program);
        this._uniformSetters = context.createUniformSetters(program);
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
        this._context.setAttributes(this._attributeSetters, data || this.bufferInfo);
    }

    public updateUniforms(...data: Dictionary<UniformData>[]) {
        this._context.setUniforms(this._uniformSetters, data);
    }
}