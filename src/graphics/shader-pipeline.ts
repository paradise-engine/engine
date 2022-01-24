import { BaseTexture } from "./base-texture";
import { NativeFramebuffer, NativeTexture } from "./types";
import { Shader } from "./shader";
import type { IRenderPipeline } from "./i-render-pipeline";
import { Color } from "../data-structures";


export class ShaderPipeline {

    private _renderPipeline: IRenderPipeline;
    private _textures: NativeTexture[] = [];
    private _fbos: NativeFramebuffer[] = [];

    constructor(renderPipeline: IRenderPipeline) {
        this._renderPipeline = renderPipeline;

        for (let i = 0; i < 2; i++) {
            const tex = this._renderPipeline.context.createGeneralPurposeTexture();
            const fbo = this._renderPipeline.context.createFramebuffer();
            this._renderPipeline.context.attachTextureToFramebuffer(tex, fbo);

            this._textures.push(tex);
            this._fbos.push(fbo);
        }
    }

    private _clear(fbo: NativeFramebuffer, texture: NativeTexture, width: number, height: number) {
        for (let i = 0; i < 2; i++) {
            this._renderPipeline.context.clearFramebuffer(fbo, Color.Transparent, width, height);
            this._renderPipeline.context.bindTexture(texture);
            this._renderPipeline.context.specifyTextureImage(width, height);
        }
    }

    public applyShaders(texture: BaseTexture, shaders: Shader[]): NativeTexture {
        shaders = shaders.filter(s => s.isActive);

        if (shaders.length === 0) {
            return texture.nativeTexture;
        }

        let nextSource: NativeTexture = texture.nativeTexture;
        let nextTargetIndex = 0;

        const outputTex = this._renderPipeline.context.createGeneralPurposeTexture();
        const outputFbo = this._renderPipeline.context.createFramebuffer();
        this._renderPipeline.context.attachTextureToFramebuffer(outputTex, outputFbo);

        for (let i = 0; i < shaders.length; i++) {
            // get source and target
            const sourceTexture = nextSource;
            const isLast = i === (shaders.length - 1);

            const targetFramebuffer = isLast ? outputFbo : this._fbos[nextTargetIndex];
            const targetTexture = isLast ? outputTex : this._textures[nextTargetIndex];
            this._clear(targetFramebuffer, targetTexture, texture.width, texture.height);

            // apply shader
            this._renderPipeline.context.bindFramebuffer(targetFramebuffer, texture.width, texture.height);
            this._renderPipeline.context.drawImage({
                shader: shaders[i],
                globalUniforms: this._renderPipeline.globalShaderData.uniforms,
                texture: sourceTexture,
                textureWidth: texture.width,
                textureHeight: texture.height,
                destinationX: 0,
                destinationY: 0,
                viewportWidth: texture.width,
                viewportHeight: texture.height,
                flipY: true
            });
            this._renderPipeline.context.bindFramebuffer(null);

            // set next source and target
            nextSource = targetTexture;
            nextTargetIndex = (nextTargetIndex === 0) ? 1 : 0;
        }

        return nextSource;
    }
}