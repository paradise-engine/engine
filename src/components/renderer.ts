import { Application } from "../application";
import { Behaviour, GameObject, SerializableBehaviour } from "../core";
import { AbstractRendererError } from "../errors";
import { RenderablePrimitive } from "../graphics";
import { DeserializationOptions, ISerializable, registerDeserializableComponent } from "../serialization";

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

    public getSerializableObject(): SerializableRenderer {
        return {
            ...super.getSerializableObject(),
            _ctor: Renderer.name
        }
    }
}

registerDeserializableComponent(Renderer);