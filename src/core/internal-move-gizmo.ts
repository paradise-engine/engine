import { GameObject } from "./game-object";
import { Behaviour, SerializableBehaviour } from "./behaviour";
import { PointerTarget } from "./pointer-target";
import { SpriteRenderer } from "./sprite-renderer";
import { Sprite } from "./sprite";
import { ResourceReference } from "./resource-reference";
import { MouseInputButton, MouseInputState } from "../input";
import { SerializableVector, Vector } from "../data-structures";
import { MicroEmitter } from "../util";
import { deserialize, ISerializable, registerDeserializableComponent } from "../serialization";

enum MoveDir {
    horizontal = 0,
    vertical = 1,
    both = 2
}

export interface MoveGizmoEvents {
    moveStart: void;
    moveEnd: Vector;
}

export interface SerializableInternalMoveGizmo extends SerializableBehaviour {
    targetId?: string;
    horizontal?: string;
    vertical?: string;
    dual?: string;
    moveDir?: MoveDir;
    mousePosSnapshot?: SerializableVector;
    startPos?: SerializableVector;
}

export class InternalMoveGizmo extends Behaviour implements ISerializable<SerializableInternalMoveGizmo> {
    public static applySerializable(s: SerializableInternalMoveGizmo, comp: InternalMoveGizmo): void {
        super.applySerializable(s, comp);

        if (s.targetId) {
            comp._targetId = s.targetId;
        }

        if (s.horizontal) {
            comp._horizontal = comp.application.managedObjectRepository.getObjectById<GameObject>(s.horizontal);
        }

        if (s.vertical) {
            comp._vertical = comp.application.managedObjectRepository.getObjectById<GameObject>(s.vertical);
        }

        if (s.dual) {
            comp._dual = comp.application.managedObjectRepository.getObjectById<GameObject>(s.dual);
        }

        if (s.moveDir) {
            comp._moveDir = s.moveDir;
        }

        if (s.mousePosSnapshot) {
            comp._mousePosSnapshot = deserialize(s.mousePosSnapshot) as Vector;
        }

        if (s.startPos) {
            comp._startPos = deserialize(s.startPos) as Vector;
        }
    }


    public static _isInternal = true;

    private _targetId: string | null = null;
    private _horizontal: GameObject | null = null;
    private _vertical: GameObject | null = null;
    private _dual: GameObject | null = null;
    private _moveDir: MoveDir | null = null;
    private _mousePosSnapshot: Vector | null = null;
    private _startPos: Vector | null = null;

    private _setUp = false;

    public readonly events: MicroEmitter<MoveGizmoEvents> = new MicroEmitter();

    private get _moveHorizontal() {
        return (
            this._moveDir === MoveDir.horizontal
            || this._moveDir === MoveDir.both
        );
    }

    private get _moveVertical() {
        return (
            this._moveDir === MoveDir.vertical
            || this._moveDir === MoveDir.both
        );
    }

    public get target() {
        if (this._targetId === null) {
            return null;
        }

        return this.application.managedObjectRepository.getObjectById<GameObject>(this._targetId);
    }

    private _handleMouseDown = (data: { object: GameObject, ev: MouseInputState }) => {
        this.events.emit('moveStart');

        switch (data.object) {
            case this._horizontal:
                this._moveDir = MoveDir.horizontal;
                break;
            case this._vertical:
                this._moveDir = MoveDir.vertical;
                break;
            default:
                this._moveDir = MoveDir.both;
        }

        this._mousePosSnapshot = data.ev.clientPos;
        this._startPos = this.gameObject.transform.position;
    }

    private _handleGlobalMouseUp = (ev: MouseInputState) => {
        if (ev.triggerButton === MouseInputButton.primary) {
            this._moveDir = null;
            this._mousePosSnapshot = null;

            let totalMove = new Vector(0, 0);

            if (this._startPos) {
                totalMove = Vector.substract(this.gameObject.transform.position, this._startPos);
                this._startPos = null;
            }

            this.events.emit('moveEnd', totalMove);
        }
    }

    public setTarget(target: GameObject | null) {
        if (target === null) {
            this._targetId = null;
        } else {
            this._targetId = target.id;
        }
    }

    public override onAwake(): void {
        if (!this._setUp) {

            let hTarget: PointerTarget | null = null;
            let vTarget: PointerTarget | null = null;
            let dTarget: PointerTarget | null = null;

            if (this._horizontal) {
                hTarget = this._horizontal.getComponent(PointerTarget) || null;
            } else {
                this._horizontal = new GameObject('internal_gizmo_move_horizontal');
                hTarget = this._horizontal.addComponent(PointerTarget);
                const hSprite = this._horizontal.addComponent(SpriteRenderer);
                hSprite.sprite = new Sprite(new ResourceReference(
                    this.application.loader.EDITOR_MOVE_HANDLE_HORIZONTAL.url,
                    this.application.loader.EDITOR_MOVE_HANDLE_HORIZONTAL.name
                ));

                this.gameObject.addChild(this._horizontal);
            }

            if (this._vertical) {
                vTarget = this._vertical.getComponent(PointerTarget) || null;
            } else {
                this._vertical = new GameObject('internal_gizmo_move_vertical');
                vTarget = this._vertical.addComponent(PointerTarget);
                const vSprite = this._vertical.addComponent(SpriteRenderer);
                vSprite.sprite = new Sprite(new ResourceReference(
                    this.application.loader.EDITOR_MOVE_HANDLE_VERTICAL.url,
                    this.application.loader.EDITOR_MOVE_HANDLE_VERTICAL.name
                ));

                this.gameObject.addChild(this._vertical);
            }

            if (this._dual) {
                dTarget = this._dual.getComponent(PointerTarget) || null;
            } else {
                this._dual = new GameObject('internal_gizmo_move_dual');
                dTarget = this._dual.addComponent(PointerTarget);
                const dSprite = this._dual.addComponent(SpriteRenderer);
                dSprite.sprite = new Sprite(new ResourceReference(
                    this.application.loader.EDITOR_MOVE_HANDLE_BOTH.url,
                    this.application.loader.EDITOR_MOVE_HANDLE_BOTH.name
                ));

                this.gameObject.addChild(this._dual);
            }

            if (hTarget && vTarget && dTarget) {

                hTarget.events.on('mousePrimaryDown', this._handleMouseDown);
                vTarget.events.on('mousePrimaryDown', this._handleMouseDown);
                dTarget.events.on('mousePrimaryDown', this._handleMouseDown);

                const mouseInput = this.application.inputManager.mouse;
                if (mouseInput) {
                    mouseInput.on('up', this._handleGlobalMouseUp);
                }
            }

            this._setUp = true;
        }
    }

    public override onDestroy(): void {
        if (this._setUp) {
            this._horizontal?.getComponent(PointerTarget)?.events.off('mousePrimaryDown', this._handleMouseDown);
            this._vertical?.getComponent(PointerTarget)?.events.off('mousePrimaryDown', this._handleMouseDown);
            this._dual?.getComponent(PointerTarget)?.events.off('mousePrimaryDown', this._handleMouseDown);

            const mouseInput = this.application.inputManager.mouse;
            if (mouseInput) {
                mouseInput.off('up', this._handleGlobalMouseUp);
            }

            this._horizontal?.destroy();
            this._vertical?.destroy();
            this._dual?.destroy();
        }
    }

    public override onUpdate(): void {
        if (this.target && this._moveDir && this._mousePosSnapshot) {
            const newMousePos = this.application.inputManager.mouse?.state;
            if (newMousePos) {

                const snapshotDelta = Vector.substract(newMousePos.clientPos, this._mousePosSnapshot);
                const delta = new Vector(
                    this._moveHorizontal ? snapshotDelta.x : 0,
                    this._moveVertical ? snapshotDelta.y : 0
                );

                this.target.transform.translate(delta);
                this._mousePosSnapshot = newMousePos.clientPos;
            }
        }
    }

    public getSerializableObject(): SerializableInternalMoveGizmo {
        return {
            ...super.getSerializableObject(),
            _ctor: InternalMoveGizmo.name,
            targetId: this._targetId || undefined,
            horizontal: this._horizontal?.id || undefined,
            vertical: this._vertical?.id || undefined,
            dual: this._dual?.id || undefined,
            moveDir: this._moveDir || undefined,
            mousePosSnapshot: this._mousePosSnapshot?.getSerializableObject() || undefined,
            startPos: this._startPos?.getSerializableObject() || undefined
        }

    }
}

registerDeserializableComponent(InternalMoveGizmo);