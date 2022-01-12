import { Resource } from "../resource";
import { BaseTexture, Texture } from "../graphics";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { Application } from "../application";
import { MicroEmitter } from "../util";
import { IComparable, Rect, SerializableRect } from "../data-structures";
import { ResourceLoaderError } from "../errors";

export interface SerializableResourceReference extends SerializableObject {
    url: string;
    textureFrame?: SerializableRect;
    name?: string;
}

export interface ResourceReferenceEvents {
    resourceLoaded: ResourceReference;
}

export class ResourceReference extends MicroEmitter<ResourceReferenceEvents> implements IComparable, ISerializable<SerializableResourceReference> {
    public static fromSerializable(s: SerializableResourceReference, options: DeserializationOptions) {
        const frame: Rect | undefined = s.textureFrame ? deserialize(s.textureFrame, options) as Rect : undefined;
        const ref = new ResourceReference(
            options.application,
            s.url,
            s.name,
            frame
        );

        return ref;
    }

    private _application: Application;
    private _isReady = false;
    private _textureFrame?: Rect;
    private _texture: Texture;

    public readonly url: string;
    public readonly name?: string;

    public get texture() {
        return this._texture;
    }

    public get isReady() {
        return this._isReady;
    }

    private _handleResourceLoaded = (res: Resource) => {
        this._isReady = true;

        if (res.texture) {
            this._texture = new Texture(res.texture, this._textureFrame || new Rect(0, 0, res.texture.width, res.texture.height));
        }

        this.memoizedEmit('resourceLoaded', this);
    }

    constructor(application: Application, url: string, name?: string, textureFrame?: Rect) {
        super();

        this.url = url;
        this.name = name;
        this._application = application;
        this._textureFrame = textureFrame;

        const existing = application.loader.getResource(name || url);
        if (existing) {
            this._handleResourceLoaded(existing);
        } else {
            application.loader.add(url, name, this._handleResourceLoaded);
        }
        application.loader.load();

        const emptyImgResource = application.loader.EMPTY_IMAGE;
        if (!emptyImgResource.texture) {
            throw new ResourceLoaderError('Cannot create resource reference to resource without texture');
        }
        this._texture = new Texture(emptyImgResource.texture);
    }

    public equals(compare: ResourceReference): boolean {
        if (this.url !== compare.url) {
            return false;
        }

        if (this.name !== compare.name) {
            return false;
        }

        if ([this._textureFrame, compare._textureFrame].filter(tf => tf === undefined).length === 1) {
            return false;
        }

        if (this._textureFrame && compare._textureFrame && !this._textureFrame.equals(compare._textureFrame)) {
            return false;
        }

        return true;
    }

    public getSerializableObject(): SerializableResourceReference {
        return {
            _ctor: ResourceReference.name,
            url: this.url,
            textureFrame: this._textureFrame ? this._textureFrame.getSerializableObject() : undefined,
            name: this.name
        }
    }
}

registerDeserializable(ResourceReference);