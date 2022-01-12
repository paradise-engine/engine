import { Dictionary } from "../../util";
import { IRenderContext } from "../i-render-context";
import { Shader } from "../shader";
import {
    AttributeSetters,
    BufferInfo,
    BufferInput,
    DrawImageOptions,
    NativeFramebuffer,
    NativeShaderProgram,
    NativeTexture,
    NativeVideoTextureInfo,
    ShaderInfo,
    TextureSource,
    UniformData,
    UniformSetters
} from "../types";
import {
    attachTextureToFramebuffer,
    createAttributeSetters,
    createBufferInfo,
    createFramebuffer,
    createGeneralPurposeTexture,
    createShaderProgram,
    createTextureFromImage,
    createUniformSetters,
    drawImage,
    drawToFramebuffer,
    initTextureFromVideo,
    resetViewport,
    setAttributes,
    setFramebuffer,
    setUniforms,
    WebGLDrawImageOptions
} from "../webgl";

export class WebGLPipelineRenderContext implements IRenderContext {

    private _glContext: WebGLRenderingContext;
    private _debugMode: boolean;

    constructor(glContext: WebGLRenderingContext, debugMode?: boolean) {
        this._glContext = glContext;
        this._debugMode = debugMode || false;
    }

    initTextureFromVideo(video: HTMLVideoElement): NativeVideoTextureInfo {
        const info = initTextureFromVideo(this._glContext, video, this._debugMode);
        return {
            texture: { texture: info.texture },
            update: info.update
        }
    }

    createTextureFromImage(image: HTMLImageElement): NativeTexture {
        return {
            texture: createTextureFromImage(this._glContext, image, this._debugMode)
        }
    }

    deleteTexture(texture: NativeTexture): void {
        this._glContext.deleteTexture(texture.texture);
    }

    createGeneralPurposeTexture(): NativeTexture {
        return {
            texture: createGeneralPurposeTexture(this._glContext, this._debugMode)
        }
    }

    bindTexture(texture: NativeTexture): void {
        this._glContext.bindTexture(this._glContext.TEXTURE_2D, texture.texture);
    }

    specifyTextureImage(width: number, height: number, source?: TextureSource) {
        this._glContext.texImage2D(
            this._glContext.TEXTURE_2D,
            0,
            this._glContext.RGBA,
            width,
            height,
            0,
            this._glContext.RGBA,
            this._glContext.UNSIGNED_BYTE,
            source as any || null
        );
    }

    createFramebuffer(): NativeFramebuffer {
        return {
            framebuffer: createFramebuffer(this._glContext, this._debugMode)
        }
    }

    attachTextureToFramebuffer(texture: NativeTexture, fbo: NativeFramebuffer): void {
        attachTextureToFramebuffer(this._glContext, texture.texture, fbo.framebuffer, this._debugMode);
    }

    drawToFramebuffer(globalUniforms: Dictionary<UniformData>, shader: Shader, texture: NativeTexture): void {
        drawToFramebuffer(this._glContext, globalUniforms, shader, texture.texture, this._debugMode);
    }

    bindFramebuffer(fbo: NativeFramebuffer | null, width: number, height: number): void {
        setFramebuffer(this._glContext, fbo, width, height, this._debugMode);
    }

    createBufferInfo(input: BufferInput): BufferInfo {
        return createBufferInfo(this._glContext, input, undefined, this._debugMode);
    }

    createShaderProgram(fragmentSource: string, vertexSource: string): ShaderInfo {
        const { program, fragmentShader, vertexShader } = createShaderProgram(this._glContext, fragmentSource, vertexSource, this._debugMode);
        return {
            program: { program },
            fragmentShader: { shader: fragmentShader },
            vertexShader: { shader: vertexShader }
        }
    }

    createAttributeSetters(program: NativeShaderProgram): AttributeSetters {
        return createAttributeSetters(this._glContext, program.program, this._debugMode);
    }

    createUniformSetters(program: NativeShaderProgram): UniformSetters {
        return createUniformSetters(this._glContext, program.program, this._debugMode);
    }

    setAttributes(setters: AttributeSetters, data: BufferInfo): void {
        setAttributes(this._glContext, setters, data, this._debugMode);
    }
    setUniforms(setters: UniformSetters, data: Dictionary<UniformData>[]): void {
        setUniforms(setters, ...data);
    }

    drawImage(options: DrawImageOptions): void {
        const augmentedOptions: WebGLDrawImageOptions = {
            gl: this._glContext,
            ...options,
            debug: this._debugMode
        };

        drawImage(augmentedOptions);
    }

    resetViewport(width: number, height: number): void {
        resetViewport(this._glContext, this._debugMode);
    }
}