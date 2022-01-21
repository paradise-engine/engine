import { Control, NumberControlOptions } from "../controls";
import { Rect } from "../data-structures";
import { AbstractRendererError } from "../errors";
import { BuiltinLayers, RenderablePrimitive } from "../graphics";
import { ISerializable, registerDeserializableComponent } from "../serialization";
import { Behaviour, SerializableBehaviour } from "./behaviour";

export interface SerializableRenderer extends SerializableBehaviour {
    layer: number;
}

export class Renderer extends Behaviour implements ISerializable<SerializableRenderer> {
    public static applySerializable(s: SerializableRenderer, comp: Renderer) {
        super.applySerializable(s, comp);
        comp.layer = s.layer;
    }

    @Control<NumberControlOptions>({
        name: 'Layer',
        options: {
            step: 1,
            asInteger: true
        }
    })
    public layer: number = BuiltinLayers.Default;

    public getPrimitive(): RenderablePrimitive {
        throw new AbstractRendererError();
    }

    public getBounds(): Rect {
        const worldPos = this.transform.position;
        return new Rect(worldPos.x, worldPos.y);
    }

    public getSerializableObject(): SerializableRenderer {
        return {
            ...super.getSerializableObject(),
            _ctor: Renderer.name,
            layer: this.layer
        }
    }
}

registerDeserializableComponent(Renderer);