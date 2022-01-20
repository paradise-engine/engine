import { Vector } from "../data-structures";
import { ISerializable, registerDeserializableComponent } from "../serialization";
import { Behaviour, SerializableBehaviour } from "./behaviour";
import { GameObject } from "./game-object";

export interface SerializableInternalGizmoHandler extends SerializableBehaviour { }

export class InternalGizmoHandler extends Behaviour implements ISerializable<SerializableInternalGizmoHandler> {
    public static applySerializable(s: SerializableInternalGizmoHandler, comp: InternalGizmoHandler): void {
        super.applySerializable(s, comp);
    }

    public static _isInternal = true;

    public override onDrawGizmos(): GameObject[] {
        const gizmos: GameObject[] = [];

        if (this.gameObject['_isSelected'] === true) {
            const moveGiz = this.application.commonGizmos?.move;
            if (moveGiz) {
                moveGiz.transform.translate(new Vector(
                    this.gameObject.transform.position.x - moveGiz.transform.position.x,
                    this.gameObject.transform.position.y - moveGiz.transform.position.y
                ));
                gizmos.push(moveGiz);
            }
        }

        return gizmos;
    }

    public getSerializableObject(): SerializableInternalGizmoHandler {
        return {
            ...super.getSerializableObject(),
            _ctor: InternalGizmoHandler.name
        }
    }
}

registerDeserializableComponent(InternalGizmoHandler);