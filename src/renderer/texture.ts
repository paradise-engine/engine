import { Rect } from "../core";
import { BaseTexture } from "./base-texture";

export class Texture {

    public readonly baseTexture: BaseTexture;
    public readonly frame: Rect;

    constructor(baseTexture: BaseTexture, frame?: Rect) {
        this.baseTexture = baseTexture;
        this.frame = frame || new Rect(0, 0, baseTexture.width, baseTexture.height);
    }
}