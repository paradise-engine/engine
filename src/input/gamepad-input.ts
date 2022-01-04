import { MicroEmitter } from "../util";
import { GamepadActuatorEffect, GamepadActuatorEffectOptions, GamepadInputEvents, IGamepadInput } from "./i-gamepad-input";

export class GamepadInput extends MicroEmitter<GamepadInputEvents> implements IGamepadInput {
    private _nextEffectId = 0;
    private _nativeGamepad: Gamepad;

    public get native() {
        return this._nativeGamepad;
    }

    public get id() {
        return this._nativeGamepad.id;
    }

    public get index() {
        return this._nativeGamepad.index;
    }

    public get connected() {
        return this._nativeGamepad.connected;
    }

    public get axes() {
        return this._nativeGamepad.axes;
    }

    public get buttons() {
        return this._nativeGamepad.buttons;
    }

    public get hasHapticActuator() {
        const act = (this._nativeGamepad as any).vibrationActuator;
        return act !== null && act !== undefined;
    }

    private _disconnectHandler = (ev: GamepadEvent) => {
        if (ev.gamepad.id === this._nativeGamepad.id) {
            this.emit('disconnected', this);
            this._tearDown();
        }
    }

    constructor(nativeGamepad: Gamepad) {
        super();
        this._nativeGamepad = nativeGamepad;

        window.addEventListener('gamepaddisconnected', this._disconnectHandler);
    }

    private _tearDown() {
        window.removeEventListener('gamepaddisconnected', this._disconnectHandler);
    }

    public playEffect(options: GamepadActuatorEffectOptions): GamepadActuatorEffect | null {
        const actuator: GamepadHapticActuator = (this._nativeGamepad as any).vibrationActuator;
        if (actuator) {
            const effect: GamepadActuatorEffect = {
                ...options,
                id: this._nextEffectId++
            }

            const effectPromise: Promise<void> = (actuator as any).playEffect('dual-rumble', options);
            this.emit('actuatorEffectStarted', effect);
            effectPromise.then(() => this.emit('actuatorEffectFinished', effect));

            return effect;
        }

        return null;
    }
}