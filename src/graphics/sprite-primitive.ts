import { mat4 } from "gl-matrix";
import { Vector } from "../data-structures";
import { IRenderPipeline } from "./i-render-pipeline";
import { RenderablePrimitive } from "./renderable-primitive";
import { Texture } from "./texture";
import { DrawImageOptions } from "./types";

export class SpritePrimitive extends RenderablePrimitive {
    public texture: Texture;
    public objectId: string;

    constructor(texture: Texture, objectId: string, globalMatrix?: mat4) {
        super(globalMatrix || mat4.create());
        this.texture = texture;
        this.objectId = objectId;
    }

    public override render(renderPipeline: IRenderPipeline, viewportOrigin: Vector) {
        const textureToRender = renderPipeline.shaderPipeline.applyShaders(this.texture.baseTexture, this.getShaders());

        const destinationWidth = this.scaleX * this.texture.frame.width;
        const destinationHeight = this.scaleY * this.texture.frame.height;

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
            destinationX: (this.x - viewportOrigin.x) - (destinationWidth / 2),
            destinationY: (this.y - viewportOrigin.y) - (destinationHeight / 2),
            destinationWidth,
            destinationHeight,
            rotationRadian: this.rotationZ
        };

        renderPipeline.enqueueRenderable([this.x, this.y], () => {
            renderPipeline.maskLayer.addObjectToMaskLayer(this.objectId, drawOptions);
            renderPipeline.context.drawImage(drawOptions);
        });
    }
}