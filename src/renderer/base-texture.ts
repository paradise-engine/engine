import { MicroEmitter } from "../util";
import { createTextureFromImage, initTextureFromVideo, TextureInfo } from "./webgl";

export enum BaseTextureType {
    Image = 'image',
    Video = 'video'
}

interface BaseTextureEvents {
    destroyed: void;
}

export class BaseTexture extends MicroEmitter<BaseTextureEvents> {

    public static createVideoTexture(gl: WebGLRenderingContext, video: HTMLVideoElement) {
        const { texture, update } = initTextureFromVideo(gl, video);
        return new BaseTexture(gl, texture, BaseTextureType.Video, video, update);
    }

    public static createImageTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
        const texture = createTextureFromImage(gl, image);
        return new BaseTexture(gl, texture, BaseTextureType.Image, image);
    }

    private _destroyed = false;
    private _updateFn?: () => void;
    private _context: WebGLRenderingContext;
    private _glTexture: WebGLTexture;

    public get context() {
        return this._context;
    }

    public get glTexture() {
        return this._glTexture;
    }

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

    private constructor(context: WebGLRenderingContext, glTexture: WebGLTexture, type: BaseTextureType, srcElement: HTMLImageElement | HTMLVideoElement, updateFn?: () => void) {
        super();
        this._context = context;
        this._glTexture = glTexture;
        this.type = type;
        this.srcElement = srcElement;
        this.width = srcElement.width;
        this.height = srcElement.height;
        this._updateFn = updateFn;
    }

    public setContext(context: WebGLRenderingContext) {
        this._context = context;

        if (this.srcElement instanceof HTMLImageElement) {
            this._glTexture = createTextureFromImage(context, this.srcElement);
        } else {
            const { texture, update } = initTextureFromVideo(context, this.srcElement);
            this._glTexture = texture;
            this._updateFn = update;
        }
    }

    public update() {
        if (this._updateFn) {
            this._updateFn();
        }
    }

    public destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            this.context.deleteTexture(this.glTexture);
            this.emit('destroyed');
        }
    }
}