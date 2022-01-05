import { BaseControlOptions, ControlType } from "../controls";
import { DeserializationOptions, deserialize, ISerializable, SerializableObject } from "../serialization";
import { ResourceReference, SerializableResourceReference } from "./resource-reference";

export interface SerializableSprite extends SerializableObject {
    resourceRef: SerializableResourceReference
}

export interface SpriteControlOptions extends BaseControlOptions { }

@ControlType()
export class Sprite implements ISerializable<SerializableSprite> {
    public static fromSerializable(s: SerializableSprite, options: DeserializationOptions) {
        return new Sprite(deserialize(s.resourceRef, options));
    }

    private _resourceReference: ResourceReference;

    public get texture() {
        return this._resourceReference.texture;
    }

    public get width() {
        return this._resourceReference.texture.frame.width;
    }

    public get height() {
        return this._resourceReference.texture.frame.height;
    }

    constructor(resourceRef: ResourceReference) {
        this._resourceReference = resourceRef;
    }

    public getSerializableObject(): SerializableSprite {
        return {
            _ctor: Sprite.name,
            resourceRef: this._resourceReference.getSerializableObject()
        }
    }
}