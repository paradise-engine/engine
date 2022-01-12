import { Application } from "../application";
import { Rect } from "../data-structures";
import { AbstractRendererError } from "../errors";
import { RenderablePrimitive } from "../graphics";
import { DeserializationOptions, ISerializable, registerDeserializableComponent } from "../serialization";
import { Behaviour, SerializableBehaviour } from "./behaviour";
import { GameObject } from "./game-object";

export interface SerializableRenderer extends SerializableBehaviour {
}

export class Renderer extends Behaviour implements ISerializable<SerializableRenderer> {
    public static applySerializable(s: SerializableRenderer, comp: Renderer) {
        super.applySerializable(s, comp);
        const options: DeserializationOptions = { application: comp.application }
    }


    constructor(application: Application, gameObject: GameObject) {
        super(application, gameObject);
    }

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
            _ctor: Renderer.name
        }
    }
}

registerDeserializableComponent(Renderer);