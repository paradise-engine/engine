import { GameObject, InternalMoveGizmo } from "../core";

export const create_editor_gizmo_move = () => {
    const gizmo = new GameObject({ name: 'internal_gizmo_move', id: 'internal_gizmo_move' });
    const moveComp = gizmo.addComponent(InternalMoveGizmo, { id: 'internal_gizmo_move_comp' });
    moveComp.onAwake();
    return gizmo;
}
