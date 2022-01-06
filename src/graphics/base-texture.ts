import { MicroEmitter } from "../util";
import { IRenderContext } from "./i-render-context";
import { NativeTexture, NativeTextureInfo } from "./types";

export enum BaseTextureType {
    Image = 'image',
    Video = 'video'
}

interface BaseTextureEvents {
    destroyed: void;
}

export class BaseTexture extends MicroEmitter<BaseTextureEvents> {

    public static emptyImage(context: IRenderContext) {
        return this.createImageTexture(context, new Image());
    }

    public static createVideoTexture(context: IRenderContext, video: HTMLVideoElement) {
        const { texture, update } = context.initTextureFromVideo(video);
        return new BaseTexture(context, texture, BaseTextureType.Video, video, update);
    }

    public static createImageTexture(context: IRenderContext, image: HTMLImageElement) {
        const texture = context.createTextureFromImage(image);
        return new BaseTexture(context, texture, BaseTextureType.Image, image);
    }

    private _destroyed = false;
    private _updateFn?: () => void;
    private _context: IRenderContext;
    private _nativeTexture: NativeTexture;

    public get context() {
        return this._context;
    }

    public get nativeTexture() {
        return this._nativeTexture;
    }

    public readonly type: BaseTextureType;
    public readonly srcElement: HTMLImageElement | HTMLVideoElement;
    public readonly width: number;
    public readonly height: number;

    public get textureInfo(): NativeTextureInfo {
        return {
            texture: this.nativeTexture,
            width: this.width,
            height: this.height,
            offsetX: 0,
            offsetY: 0
        };
    }

    private constructor(context: IRenderContext, nativeTexture: NativeTexture, type: BaseTextureType, srcElement: HTMLImageElement | HTMLVideoElement, updateFn?: () => void) {
        super();
        this._context = context;
        this._nativeTexture = nativeTexture;
        this.type = type;
        this.srcElement = srcElement;
        this.width = srcElement.width;
        this.height = srcElement.height;
        this._updateFn = updateFn;
    }

    public setContext(context: IRenderContext) {
        this._context = context;

        if (this.srcElement instanceof HTMLImageElement) {
            this._nativeTexture = context.createTextureFromImage(this.srcElement);
        } else {
            const { texture, update } = context.initTextureFromVideo(this.srcElement);
            this._nativeTexture = texture;
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
            this.context.deleteTexture(this.nativeTexture);
            this.emit('destroyed');
        }
    }
}