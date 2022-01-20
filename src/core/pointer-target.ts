import { Application } from "../application";
import { MouseInputButton, MouseInputMoveEvent, MouseInputState } from "../input";
import { ISerializable, registerDeserializableComponent } from "../serialization";
import { MicroEmitter } from "../util/micro-emitter";
import { Behaviour, SerializableBehaviour } from "./behaviour";
import { GameObject } from "./game-object";

export interface PointerTargetEvents {
    mouseEnter: GameObject;
    mouseLeave: GameObject;
    mouseDown: { object: GameObject, ev: MouseInputState };
    mouseUp: { object: GameObject, ev: MouseInputState };

    mousePrimaryDown: { object: GameObject, ev: MouseInputState };
    mousePrimaryUp: { object: GameObject, ev: MouseInputState };

    mouseSecondaryDown: { object: GameObject, ev: MouseInputState };
    mouseSecondaryUp: { object: GameObject, ev: MouseInputState };

    mouseAuxDown: { object: GameObject, ev: MouseInputState };
    mouseAuxUp: { object: GameObject, ev: MouseInputState };
}

export interface SerializablePointerTarget extends SerializableBehaviour { }

export class PointerTarget extends Behaviour implements ISerializable<SerializablePointerTarget> {
    public static override applySerializable(s: SerializablePointerTarget, comp: PointerTarget): void {
        super.applySerializable(s, comp);
    }

    private _handlersSetUp = false;
    private _objectHover = false;
    public events: MicroEmitter<PointerTargetEvents> = new MicroEmitter();

    constructor(gameObject: GameObject) {
        super(gameObject);

        console.log(`POINTER TARGET ${this.id} CREATED FOR OBJECT '${gameObject.name}'`);
    }

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

    private _handleMouseDown = (ev: MouseInputState) => {
        if (this._objectHover) {
            this.events.emit('mouseDown', { object: this.gameObject, ev });

            switch (ev.triggerButton) {
                case MouseInputButton.primary:
                    this.events.emit('mousePrimaryDown', { object: this.gameObject, ev });
                    break;
                case MouseInputButton.secondary:
                    this.events.emit('mouseSecondaryDown', { object: this.gameObject, ev });
                    break;
                case MouseInputButton.auxiliary:
                    this.events.emit('mouseAuxDown', { object: this.gameObject, ev });
                    break;
            }
        }
    }

    private _handleMouseUp = (ev: MouseInputState) => {
        if (this._objectHover) {
            this.events.emit('mouseUp', { object: this.gameObject, ev });

            switch (ev.triggerButton) {
                case MouseInputButton.primary:
                    this.events.emit('mousePrimaryUp', { object: this.gameObject, ev });
                    break;
                case MouseInputButton.secondary:
                    this.events.emit('mouseSecondaryUp', { object: this.gameObject, ev });
                    break;
                case MouseInputButton.auxiliary:
                    this.events.emit('mouseAuxUp', { object: this.gameObject, ev });
                    break;
            }
        }
    }

    private _initHandlers() {
        if (!this._handlersSetUp && this.isActive && !this.isDestroyed) {
            const mouseInput = this.application.inputManager.mouse;
            if (mouseInput) {
                mouseInput.on('move', this._handleMouseMove);
                mouseInput.on('down', this._handleMouseDown);
                mouseInput.on('up', this._handleMouseUp);
                this._handlersSetUp = true;
            }
        }
    }

    private _tearDownHandlers() {
        if (this._handlersSetUp) {
            const mouseInput = this.application.inputManager.mouse;
            if (mouseInput) {
                mouseInput.off('move', this._handleMouseMove);
                mouseInput.off('down', this._handleMouseDown);
                mouseInput.off('up', this._handleMouseUp);
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