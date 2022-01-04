import { attachTextureToFramebuffer, createFramebuffer, createGeneralPurposeTexture, drawToFramebuffer, setFramebuffer, Shader } from "./webgl";
import { BaseTexture } from "./base-texture";
import type { WebGLRenderPipeline } from "./webgl-render-pipeline";


export class ShaderPipeline {

    private _renderPipeline: WebGLRenderPipeline;

    constructor(renderPipeline: WebGLRenderPipeline) {
        this._renderPipeline = renderPipeline;
    }

    private _createAndResizeTexture(width: number, height: number) {
        const gl = this._renderPipeline.context;
        const tex = createGeneralPurposeTexture(gl);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        return tex;
    }

    public applyShaders(texture: BaseTexture, shaders: Shader[]) {
        shaders = shaders.filter(s => s.isActive);

        if (shaders.length === 0) {
            return texture.glTexture;
        }

        const textures = [];
        const fbos = [];

        for (let i = 0; i < 2; i++) {
            const tex = this._createAndResizeTexture(texture.width, texture.height);
            const fbo = createFramebuffer(this._renderPipeline.context);
            attachTextureToFramebuffer(this._renderPipeline.context, tex, fbo);

            textures.push(tex);
            fbos.push(fbo);
        }

        const outputTexture = createGeneralPurposeTexture(this._renderPipeline.context);
        const outputFbo = createFramebuffer(this._renderPipeline.context);
        attachTextureToFramebuffer(this._renderPipeline.context, outputTexture, outputFbo);

        let nextSource: WebGLTexture = texture.glTexture;
        let nextTargetIndex = 0;

        for (let i = 0; i < shaders.length; i++) {
            // get source and target
            const sourceTexture = nextSource;
            const targetFramebuffer = (i === shaders.length - 1) ? outputFbo : fbos[nextTargetIndex];

            // apply shader
            this._setFramebuffer(targetFramebuffer, texture.width, texture.height);
            drawToFramebuffer(this._renderPipeline.context, this._renderPipeline.globalShaderData.uniforms, shaders[i], sourceTexture);

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

    private _setFramebuffer(fbo: WebGLFramebuffer | null, width?: number, height?: number) {
        width = width || 1;
        height = height || 1;

        if (fbo === null) {
            width = this._renderPipeline.view.width;
            height = this._renderPipeline.view.height;
        }

        this._renderPipeline.globalShaderData.setUniform('u_resolution', [width, height]);
        setFramebuffer(this._renderPipeline.context, fbo, width, height);
    }

}