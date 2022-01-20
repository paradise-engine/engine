import { Application } from "../application";
import { GameObject } from "../core";
import { deserialize } from "../serialization";
import { editor_gizmo_move } from "./_editor-move-gizmo";

export interface CommonGizmos {
    move: GameObject;
}

function createMoveGizmo(application: Application): GameObject {
    const gizmo: GameObject = deserialize(editor_gizmo_move, { application });
    return gizmo;
}

export function createCommonGizmos(application: Application): CommonGizmos {
    return {
        move: createMoveGizmo(application)
    }
}