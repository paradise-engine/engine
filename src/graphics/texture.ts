import { Rect } from "../data-structures";
import { BaseTexture } from "./base-texture";
import { NativeTextureInfo } from "./types";

export class Texture {

    public readonly baseTexture: BaseTexture;
    public readonly frame: Rect;

    public get textureInfo(): NativeTextureInfo {
        return {
            texture: this.baseTexture.nativeTexture,
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