import { Dictionary } from "../util";
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

export abstract class Shader {

    protected _gl: WebGLRenderingContext;

    protected _internals: ShaderInternals;
    protected _program: WebGLProgram;
    protected _attributeSetters: AttributeSetters;
    protected _uniformSetters: UniformSetters;

    public get internals() {
        return this._internals;
    }

    public get program() {
        return this._program;
    }

    protected constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {

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
    }

    public updateAttributes(data: BufferInfo) {
        setAttributes(this._gl, this._attributeSetters, data);
    }

    public updateUniforms(data: Dictionary<UniformData>) {
        setUniforms(this._uniformSetters, data);
    }
}