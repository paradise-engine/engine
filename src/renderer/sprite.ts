import { mat4 } from "gl-matrix";
import { drawImage, DrawImageOptions } from "./webgl";
import { RenderablePrimitive } from "./renderable-primitive";
import { Renderer } from "./renderer";
import { Texture } from "./texture";

export class Sprite extends RenderablePrimitive {
    public texture: Texture;

    constructor(texture: Texture, globalMatrix?: mat4) {
        super(globalMatrix || mat4.create());
        this.texture = texture;
    }

    render(renderer: Renderer) {
        const textureToRender = renderer.shaderPipeline.applyShaders(this.texture.baseTexture, this.getShaders());

        const drawOptions: DrawImageOptions = {
            gl: renderer.context,
            shader: renderer.baseShader,
            globalUniforms: renderer.globalShaderData.uniforms,
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

        drawImage(drawOptions);
    }
}