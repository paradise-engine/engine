import { UniformTuple } from "../util";
import { attachTextureToFramebuffer, createFramebuffer, createGeneralPurposeTexture, drawToFramebuffer, setFramebuffer, Shader } from "../webgl";
import { BaseTexture } from "./base-texture";
import type { Renderer } from "./renderer";


export class ShaderPipeline {

    private _renderer: Renderer;
    private _textures: UniformTuple<WebGLTexture>;
    private _fbos: UniformTuple<WebGLFramebuffer>;

    constructor(renderer: Renderer) {
        this._renderer = renderer;

        this._textures = [
            createGeneralPurposeTexture(this._renderer.context),
            createGeneralPurposeTexture(this._renderer.context)
        ];

        this._fbos = [
            createFramebuffer(this._renderer.context),
            createFramebuffer(this._renderer.context)
        ]

        attachTextureToFramebuffer(this._renderer.context, this._textures[0], this._fbos[0]);
        attachTextureToFramebuffer(this._renderer.context, this._textures[1], this._fbos[1]);
    }

    public applyShaders(texture: BaseTexture, shaders: Shader[]) {
        shaders = shaders.filter(s => s.isActive);

        if (shaders.length === 0) {
            return texture.glTexture;
        }
        const outputTexture = createGeneralPurposeTexture(this._renderer.context);
        const outputFbo = createFramebuffer(this._renderer.context);
        attachTextureToFramebuffer(this._renderer.context, outputTexture, outputFbo);

        let nextSource: WebGLTexture = texture.glTexture;
        let nextTargetIndex = 0;

        for (let i = 0; i < shaders.length; i++) {
            // get source and target
            const sourceTexture = nextSource;
            const targetFramebuffer = (i === shaders.length - 1) ? outputFbo : this._fbos[nextTargetIndex];

            // apply shader
            this._setFramebuffer(targetFramebuffer, texture.width, texture.height);
            drawToFramebuffer(this._renderer.context, this._renderer.globalShaderData.uniforms, shaders[i], sourceTexture);

            // set next source and target
            if (nextSource !== this._textures[0]) {
                nextSource = this._textures[0];
            } else {
                nextSource = this._textures[1];
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
            width = this._renderer.view.width;
            height = this._renderer.view.height;
        }

        this._renderer.globalShaderData.setUniform('u_resolution', [width, height]);
        setFramebuffer(this._renderer.context, fbo, width, height);
    }

}