import { Color } from "../data-structures";
import { Dictionary } from "../util";
import { Shader } from "./shader";
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
} from "./types";

export interface IRenderContext {
    initTextureFromVideo(video: HTMLVideoElement): NativeVideoTextureInfo;
    createTextureFromImage(image: HTMLImageElement): NativeTexture;
    deleteTexture(texture: NativeTexture): void;
    createGeneralPurposeTexture(): NativeTexture;
    bindTexture(texture: NativeTexture): void;
    specifyTextureImage(width: number, height: number, source?: TextureSource): void;
    createFramebuffer(): NativeFramebuffer;
    attachTextureToFramebuffer(texture: NativeTexture, fbo: NativeFramebuffer): void;
    drawToFramebuffer(globalUniforms: Dictionary<UniformData>, shader: Shader, texture: NativeTexture): void
    bindFramebuffer(fbo: NativeFramebuffer | null, width?: number, height?: number): void;

    createBufferInfo(input: BufferInput): BufferInfo;
    createShaderProgram(fragmentSource: string, vertexSource: string): ShaderInfo;
    createAttributeSetters(program: NativeShaderProgram): AttributeSetters;
    createUniformSetters(program: NativeShaderProgram): UniformSetters;
    setAttributes(setters: AttributeSetters, data: BufferInfo): void;
    setUniforms(setters: UniformSetters, data: Dictionary<UniformData>[]): void;

    drawImage(options: DrawImageOptions): void;
    resetViewport(width: number, height: number): void;

    clearViewport(clearColor: Color): void;
    clearFramebuffer(fbo: NativeFramebuffer, clearColor: Color, width?: number, height?: number): void;
    readPixel(pixelX: number, pixelY: number, fbo?: NativeFramebuffer): Color;
}