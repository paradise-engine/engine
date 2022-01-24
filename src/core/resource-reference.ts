import { Resource, ResourceStatus } from "../resource";
import { Texture } from "../graphics";
import { deserialize, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
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
    public static fromSerializable(s: SerializableResourceReference) {
        const frame: Rect | undefined = s.textureFrame ? deserialize(s.textureFrame) as Rect : undefined;
        const ref = new ResourceReference(
            s.url,
            s.name,
            frame
        );

        return ref;
    }

    private get _application() {
        return Application.instance;
    }

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

    constructor(url: string, name?: string, textureFrame?: Rect) {
        super();

        this.url = url;
        this.name = name;
        this._textureFrame = textureFrame;

        const emptyImgResource = this._application.loader.EMPTY_IMAGE;
        if (!emptyImgResource.texture) {
            throw new ResourceLoaderError('Cannot create resource reference to resource without texture');
        }
        this._texture = new Texture(emptyImgResource.texture);

        const existing = this._application.loader.getResource(name || url);
        if (existing && existing.status !== ResourceStatus.FlaggedForUnload) {
            this._handleResourceLoaded(existing);
        } else {
            this._application.loader.add(url, name, this._handleResourceLoaded);
        }
    }

    public refreshResource() {
        const existing = this._application.loader.getResource(this.name || this.url);
        if (existing && existing.status !== ResourceStatus.FlaggedForUnload) {
            this._handleResourceLoaded(existing);
        } else {
            this._application.loader.add(this.url, this.name, this._handleResourceLoaded);
        }
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