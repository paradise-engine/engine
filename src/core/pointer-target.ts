import { MouseInputMoveEvent } from "../input";
import { ISerializable, registerDeserializableComponent } from "../serialization";
import { MicroEmitter } from "../util/micro-emitter";
import { Behaviour, SerializableBehaviour } from "./behaviour";
import { GameObject } from "./game-object";

export interface PointerTargetEvents {
    mouseEnter: GameObject;
    mouseLeave: GameObject;
}

export interface SerializablePointerTarget extends SerializableBehaviour { }

export class PointerTarget extends Behaviour implements ISerializable<SerializablePointerTarget> {
    public static override applySerializable(s: SerializablePointerTarget, comp: PointerTarget): void {
        super.applySerializable(s, comp);
    }

    private _handlersSetUp = false;
    private _objectHover = false;
    public events: MicroEmitter<PointerTargetEvents> = new MicroEmitter();

    private _handleMouseMove = (ev: MouseInputMoveEvent) => {
        const pointerObject = this.application.renderPipeline.maskLayer.probePosition(ev.viewPos.x, ev.viewPos.y);
        let pointerOnSelf = false;
        if (pointerObject && pointerObject === this.gameObject.id) {
            pointerOnSelf = true;
        }

        if (!this._objectHover && pointerOnSelf) {
            this.events.emit('mouseEnter', this.gameObject);
        }

        if (this._objectHover && !pointerOnSelf) {
            this.events.emit('mouseLeave', this.gameObject);
        }

        this._objectHover = pointerOnSelf;
    }

    private _initHandlers() {
        if (!this._handlersSetUp && this.isActive && !this.isDestroyed) {
            const mouseInput = this.application.inputManager.mouse;
            if (mouseInput) {
                mouseInput.on('move', this._handleMouseMove);

                this.events.on('mouseEnter', (gameObject) => {
                    console.log(`[POINTER TARGET] Enter object ${gameObject.name} (${gameObject.id})`);
                });

                this.events.on('mouseLeave', (gameObject) => {
                    console.log(`[POINTER TARGET] Leave object ${gameObject.name} (${gameObject.id})`);
                });

                this._handlersSetUp = true;
            }
        }
    }

    private _tearDownHandlers() {
        if (this._handlersSetUp) {
            const mouseInput = this.application.inputManager.mouse;
            if (mouseInput) {
                mouseInput.off('move', this._handleMouseMove);
                this._handlersSetUp = false;
            }
        }
    }

    public override onAwake() {
        this._initHandlers();
    }

    public override onEnable() {
        this._initHandlers();
    }

    public override onDisable() {
        this._tearDownHandlers();
    }

    public override onDestroy(): void {
        this._tearDownHandlers();
    }

    public override getSerializableObject(): SerializablePointerTarget {
        return {
            ...super.getSerializableObject(),
            _ctor: PointerTarget.name
        }
    }
}

registerDeserializableComponent(PointerTarget);