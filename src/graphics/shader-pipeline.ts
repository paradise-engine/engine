import { BaseTexture } from "./base-texture";
import { NativeFramebuffer, NativeTexture } from "./types";
import { Shader } from "./shader";
import type { IRenderPipeline } from "./i-render-pipeline";


export class ShaderPipeline {

    private _renderPipeline: IRenderPipeline;

    constructor(renderPipeline: IRenderPipeline) {
        this._renderPipeline = renderPipeline;
    }

    private _createAndResizeTexture(width: number, height: number) {
        const context = this._renderPipeline.context;
        const tex = this._renderPipeline.context.createGeneralPurposeTexture();
        context.bindTexture(tex);
        context.specifyTextureImage(width, height);
        return tex;
    }

    public applyShaders(texture: BaseTexture, shaders: Shader[]) {
        shaders = shaders.filter(s => s.isActive);

        if (shaders.length === 0) {
            return texture.nativeTexture;
        }

        const textures: NativeTexture[] = [];
        const fbos: NativeFramebuffer[] = [];

        for (let i = 0; i < 2; i++) {
            const tex = this._createAndResizeTexture(texture.width, texture.height);
            const fbo = this._renderPipeline.context.createFramebuffer();
            this._renderPipeline.context.attachTextureToFramebuffer(tex, fbo);

            textures.push(tex);
            fbos.push(fbo);
        }

        const outputTexture = this._renderPipeline.context.createGeneralPurposeTexture();
        const outputFbo = this._renderPipeline.context.createFramebuffer();
        this._renderPipeline.context.attachTextureToFramebuffer(outputTexture, outputFbo);

        let nextSource: NativeTexture = texture.nativeTexture;
        let nextTargetIndex = 0;

        for (let i = 0; i < shaders.length; i++) {
            // get source and target
            const sourceTexture = nextSource;
            const targetFramebuffer = (i === shaders.length - 1) ? outputFbo : fbos[nextTargetIndex];

            // apply shader
            this._setFramebuffer(targetFramebuffer, texture.width, texture.height);
            this._renderPipeline.context.drawToFramebuffer(this._renderPipeline.globalShaderData.uniforms, shaders[i], sourceTexture);

            // set next source and target
            if (nextSource !== textures[0]) {
                nextSource = textures[0];
            } else {
                nextSource = textures[1];
            }

            nextTargetIndex = nextTargetIndex === 0 ? 1 : 0;
        }

        this._setFramebuffer(null);
        return outputTexture;
    }

    private _setFramebuffer(fbo: NativeFramebuffer | null, width?: number, height?: number) {
        width = width || 1;
        height = height || 1;

        if (fbo === null) {
            width = this._renderPipeline.view.width;
            height = this._renderPipeline.view.height;
        }

        this._renderPipeline.globalShaderData.setUniform('u_resolution', [width, height]);
        this._renderPipeline.context.bindFramebuffer(fbo, width, height);
    }

}