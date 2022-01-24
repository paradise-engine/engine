import { Control } from "../controls";
import { SpritePrimitive } from "../graphics";
import { deserialize, ISerializable, registerDeserializableComponent } from "../serialization";
import { vec2 } from 'gl-matrix';
import { Color, ColorControlOptions, Rect, SerializableColor } from "../data-structures";
import { Renderer, SerializableRenderer } from "./renderer";
import { SerializableSprite, Sprite, SpriteControlOptions } from "./sprite";
import { GameObject } from "./game-object";
import { ResourceReference } from "./resource-reference";
import { ManagedObjectOptions } from "./managed-object";

export interface SerializableSpriteRenderer extends SerializableRenderer {
    sprite: SerializableSprite;
    color: SerializableColor;
}

export class SpriteRenderer extends Renderer implements ISerializable<SerializableSpriteRenderer> {
    public static applySerializable(s: SerializableSpriteRenderer, comp: SpriteRenderer) {
        super.applySerializable(s, comp);

        comp.sprite = deserialize(s.sprite);
        comp.color = deserialize(s.color);
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

    constructor(gameObject: GameObject, options?: ManagedObjectOptions) {
        super(gameObject, options);

        const emptyImageRes = this.application.loader.EMPTY_IMAGE;
        const ref = new ResourceReference(emptyImageRes.url, emptyImageRes.name);

        this.sprite = new Sprite(ref);
        this.color = Color.White;
    }

    public override onAwake(): void {
        this.sprite.resourceReference.refreshResource();
    }

    public override getPrimitive(): SpritePrimitive {
        const primitive = new SpritePrimitive(this.sprite.texture, this.gameObject.id, this.layer, this.transform.getGlobalMatrix());
        for (const shader of this.shaders.getShaders()) {
            primitive.addShader(shader);
        }

        return primitive;
    }

    public override getBounds(): Rect {
        const tl = vec2.create();
        const tr = vec2.create();
        const bl = vec2.create();
        const br = vec2.create();

        const worldMatrix = this.transform.getGlobalMatrix();

        // Calculate the position of the four corners in world space by applying
        // The world matrix to the four corners in object space (0, 0, width, height)
        vec2.transformMat4(tl, vec2.zero(vec2.create()), worldMatrix);
        vec2.transformMat4(tr, vec2.set(vec2.create(), this.sprite.width, 0), worldMatrix);
        vec2.transformMat4(bl, vec2.set(vec2.create(), 0, this.sprite.height), worldMatrix);
        vec2.transformMat4(br, vec2.set(vec2.create(), this.sprite.width, this.sprite.height), worldMatrix);

        // Find the minimum and maximum "corners" based on the ones above
        const minX = Math.min(tl[0], Math.min(tr[0], Math.min(bl[0], br[0])));
        const maxX = Math.max(tl[0], Math.max(tr[0], Math.max(bl[0], br[0])));
        const minY = Math.min(tl[1], Math.min(tr[1], Math.min(bl[1], br[1])));
        const maxY = Math.max(tl[1], Math.max(tr[1], Math.max(bl[1], br[1])));

        return new Rect(
            minX,
            minY,
            maxX - minX,
            maxY - minY
        );
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