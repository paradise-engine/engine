import { Application } from "../application";
import { Control } from "../controls";
import { Color, ColorControlOptions, GameObject, ResourceReference, SerializableColor, SerializableSprite, Sprite, SpriteControlOptions } from "../core";
import { SpritePrimitive } from "../graphics";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializableComponent } from "../serialization";
import { Renderer, SerializableRenderer } from "./renderer";

export interface SerializableSpriteRenderer extends SerializableRenderer {
    sprite: SerializableSprite;
    color: SerializableColor;
}

export class SpriteRenderer extends Renderer implements ISerializable<SerializableSpriteRenderer> {
    public static applySerializable(s: SerializableSpriteRenderer, comp: SpriteRenderer) {
        super.applySerializable(s, comp);
        const options: DeserializationOptions = { application: comp.application }

        comp.sprite = deserialize(s.sprite, options);
        comp.color = deserialize(s.color, options);
    }

    @Control<SpriteControlOptions>({
        name: 'Sprite',
        options: {}
    })
    public sprite: Sprite;

    @Control<ColorControlOptions>({
        name: 'Color',
        options: {}
    })
    public color: Color;

    constructor(application: Application, gameObject: GameObject) {
        super(application, gameObject);

        const emptyImageRes = application.loader.EMPTY_IMAGE;
        const ref = new ResourceReference(application, emptyImageRes.url, emptyImageRes.name);

        this.sprite = new Sprite(ref);
        this.color = Color.White;
    }

    public override getPrimitive(): SpritePrimitive {
        return new SpritePrimitive(this.sprite.texture, this.gameObject.transform.getGlobalMatrix());
    }

    public override getSerializableObject(): SerializableSpriteRenderer {
        return {
            ...super.getSerializableObject(),
            _ctor: SpriteRenderer.name,
            sprite: this.sprite.getSerializableObject(),
            color: this.color.getSerializableObject()
        }
    }
}

registerDeserializableComponent(SpriteRenderer);