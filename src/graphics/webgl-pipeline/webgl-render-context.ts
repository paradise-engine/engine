import { Color } from "../../data-structures";
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

        this._glContext.texParameteri(this._glContext.TEXTURE_2D, this._glContext.TEXTURE_MIN_FILTER, this._glContext.LINEAR);
        this._glContext.texParameteri(this._glContext.TEXTURE_2D, this._glContext.TEXTURE_WRAP_S, this._glContext.CLAMP_TO_EDGE);
        this._glContext.texParameteri(this._glContext.TEXTURE_2D, this._glContext.TEXTURE_WRAP_T, this._glContext.CLAMP_TO_EDGE);
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

    bindFramebuffer(fbo: NativeFramebuffer | null, width?: number, height?: number): void {
        width = (width === undefined) ? this._glContext.canvas.width : width;
        height = (height === undefined) ? this._glContext.canvas.height : height;

        setFramebuffer(this._glContext, fbo?.framebuffer, width, height, this._debugMode);
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

    clearViewport(clearColor: Color): void {

        const comps = clearColor.getNormalized();
        this._glContext.clearColor(comps[0], comps[1], comps[2], comps[3]);
        this._glContext.clear(this._glContext.COLOR_BUFFER_BIT | this._glContext.DEPTH_BUFFER_BIT | this._glContext.STENCIL_BUFFER_BIT);
    }
    clearFramebuffer(fbo: { framebuffer: any; }, clearColor: Color, width?: number, height?: number): void {
        this.bindFramebuffer(fbo, width, height);
        const status = this._glContext.checkFramebufferStatus(this._glContext.FRAMEBUFFER);
        if (status === this._glContext.FRAMEBUFFER_COMPLETE) {
            this.clearViewport(clearColor);
        }
        this.bindFramebuffer(null);
    }
    readPixel(pixelX: number, pixelY: number, fbo?: NativeFramebuffer): Color {

        if (fbo && fbo.framebuffer) {
            this.bindFramebuffer(fbo);
        }

        const data = new Uint8Array(4);
        this._glContext.readPixels(
            pixelX,
            pixelY,
            1,
            1,
            this._glContext.RGBA,
            this._glContext.UNSIGNED_BYTE,
            data
        );

        if (fbo && fbo.framebuffer) {
            this.bindFramebuffer(null)
        }

        return Color.fromUint8Array(data);
    }
}