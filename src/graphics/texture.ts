import { Rect } from "../core";
import { TextureInfo } from "./webgl";
import { BaseTexture } from "./base-texture";

export class Texture {

    public readonly baseTexture: BaseTexture;
    public readonly frame: Rect;

    public get textureInfo(): TextureInfo {
        return {
            texture: this.baseTexture.glTexture,
            width: this.frame.width,
            height: this.frame.height,
            offsetX: this.frame.x,
            offsetY: this.frame.y
        };
    }

    constructor(baseTexture: BaseTexture, frame?: Rect) {
        this.baseTexture = baseTexture;
        this.frame = frame || new Rect(0, 0, baseTexture.width, baseTexture.height);
    }
}