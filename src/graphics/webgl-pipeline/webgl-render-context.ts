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

    constructor(glContext: WebGLRenderingContext) {
        this._glContext = glContext;
    }

    initTextureFromVideo(video: HTMLVideoElement): NativeVideoTextureInfo {
        const info = initTextureFromVideo(this._glContext, video);
        return {
            texture: { texture: info.texture },
            update: info.update
        }
    }

    createTextureFromImage(image: HTMLImageElement): NativeTexture {
        return {
            texture: createTextureFromImage(this._glContext, image)
        }
    }

    deleteTexture(texture: NativeTexture): void {
        this._glContext.deleteTexture(texture.texture);
    }

    createGeneralPurposeTexture(): NativeTexture {
        return {
            texture: createGeneralPurposeTexture(this._glContext)
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
            framebuffer: createFramebuffer(this._glContext)
        }
    }

    attachTextureToFramebuffer(texture: NativeTexture, fbo: NativeFramebuffer): void {
        attachTextureToFramebuffer(this._glContext, texture.texture, fbo.framebuffer);
    }

    drawToFramebuffer(globalUniforms: Dictionary<UniformData>, shader: Shader, texture: NativeTexture): void {
        drawToFramebuffer(this._glContext, globalUniforms, shader, texture.texture);
    }

    bindFramebuffer(fbo: NativeFramebuffer | null, width: number, height: number): void {
        setFramebuffer(this._glContext, fbo, width, height);
    }

    createBufferInfo(input: BufferInput): BufferInfo {
        return createBufferInfo(this._glContext, input);
    }

    createShaderProgram(fragmentSource: string, vertexSource: string): ShaderInfo {
        const { program, fragmentShader, vertexShader } = createShaderProgram(this._glContext, fragmentSource, vertexSource);
        return {
            program: { program },
            fragmentShader: { shader: fragmentShader },
            vertexShader: { shader: vertexShader }
        }
    }

    createAttributeSetters(program: NativeShaderProgram): AttributeSetters {
        return createAttributeSetters(this._glContext, program.program);
    }

    createUniformSetters(program: NativeShaderProgram): UniformSetters {
        return createUniformSetters(this._glContext, program.program);
    }

    setAttributes(setters: AttributeSetters, data: BufferInfo): void {
        setAttributes(this._glContext, setters, data);
    }
    setUniforms(setters: UniformSetters, data: Dictionary<UniformData>[]): void {
        setUniforms(setters, ...data);
    }

    drawImage(options: DrawImageOptions): void {
        const augmentedOptions: WebGLDrawImageOptions = {
            gl: this._glContext,
            ...options
        };

        drawImage(augmentedOptions);
    }

    resetViewport(width: number, height: number): void {
        resetViewport(this._glContext);
    }
}