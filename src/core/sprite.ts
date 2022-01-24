import { BaseControlOptions, ControlType } from "../controls";
import { IComparable } from "../data-structures";
import { deserialize, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { ResourceReference, SerializableResourceReference } from "./resource-reference";

export interface SerializableSprite extends SerializableObject {
    resourceRef: SerializableResourceReference
}

export interface SpriteControlOptions extends BaseControlOptions { }

@ControlType()
export class Sprite implements IComparable, ISerializable<SerializableSprite> {
    public static fromSerializable(s: SerializableSprite) {
        return new Sprite(deserialize(s.resourceRef));
    }

    private _resourceReference: ResourceReference;

    public get resourceReference() {
        return this._resourceReference;
    }

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

    public equals(compare: Sprite): boolean {
        return this._resourceReference.equals(compare._resourceReference);
    }

    public getSerializableObject(): SerializableSprite {
        return {
            _ctor: Sprite.name,
            resourceRef: this._resourceReference.getSerializableObject()
        }
    }
}

registerDeserializable(Sprite);