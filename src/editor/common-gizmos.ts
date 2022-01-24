import { GameObject } from "../core";
import { create_editor_gizmo_move } from "./_editor-move-gizmo";

export interface CommonGizmos {
    move: GameObject;
}

function createMoveGizmo(): GameObject {
    const gizmo: GameObject = create_editor_gizmo_move();
    return gizmo;
}

export function createCommonGizmos(): CommonGizmos {
    return {
        move: createMoveGizmo()
    }
}