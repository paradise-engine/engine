import { mat4 } from "gl-matrix";
import { IRenderPipeline } from "./i-render-pipeline";
import { RenderablePrimitive } from "./renderable-primitive";
import { Texture } from "./texture";
import { DrawImageOptions } from "./types";

export class SpritePrimitive extends RenderablePrimitive {
    public texture: Texture;

    constructor(texture: Texture, globalMatrix?: mat4) {
        super(globalMatrix || mat4.create());
        this.texture = texture;
    }

    render(renderPipeline: IRenderPipeline) {
        const textureToRender = renderPipeline.shaderPipeline.applyShaders(this.texture.baseTexture, this.getShaders());

        const drawOptions: DrawImageOptions = {
            shader: renderPipeline.baseShader,
            globalUniforms: renderPipeline.globalShaderData.uniforms,
            texture: textureToRender,
            textureWidth: this.texture.baseTexture.width,
            textureHeight: this.texture.baseTexture.height,
            sourceX: this.texture.frame.x,
            sourceY: this.texture.frame.y,
            sourceWidth: this.texture.frame.width,
            sourceHeight: this.texture.frame.height,
            destinationX: this.x,
            destinationY: this.y,
            destinationWidth: this.scaleX * this.texture.frame.width,
            destinationHeight: this.scaleY * this.texture.frame.height,
            rotationRadian: this.rotationZ
        };

        renderPipeline.enqueueRenderable([this.x, this.y], () => {
            renderPipeline.context.drawImage(drawOptions);
        });
    }
}