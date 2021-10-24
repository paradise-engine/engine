import { createTextureFromImage, initTextureFromVideo, TextureInfo } from "../webgl";

export enum BaseTextureType {
    Image = 'image',
    Video = 'video'
}

export class BaseTexture {

    public static createVideoTexture(gl: WebGLRenderingContext, video: HTMLVideoElement) {
        const { texture, update } = initTextureFromVideo(gl, video);
        return new BaseTexture(texture, BaseTextureType.Video, video, update);
    }

    public static createImageTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
        const texture = createTextureFromImage(gl, image);
        return new BaseTexture(texture, BaseTextureType.Image, image);
    }

    private readonly _updateFn?: () => void;

    public readonly glTexture: WebGLTexture;
    public readonly type: BaseTextureType;
    public readonly srcElement: HTMLImageElement | HTMLVideoElement;
    public readonly width: number;
    public readonly height: number;

    public get textureInfo(): TextureInfo {
        return {
            texture: this.glTexture,
            width: this.width,
            height: this.height,
            offsetX: 0,
            offsetY: 0
        };
    }

    private constructor(glTexture: WebGLTexture, type: BaseTextureType, srcElement: HTMLImageElement | HTMLVideoElement, updateFn?: () => void) {
        this.glTexture = glTexture;
        this.type = type;
        this.srcElement = srcElement;
        this.width = srcElement.width;
        this.height = srcElement.height;
        this._updateFn = updateFn;
    }

    public update() {
        if (this._updateFn) {
            this._updateFn();
        }
    }
}