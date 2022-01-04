import { IEmitter } from "../util";

export interface GamepadActuatorEffectOptions {
    duration: number;
    startDelay: number;
    strongMagnitude: number;
    weakMagnitude: number;
}

export interface GamepadActuatorEffect extends Readonly<GamepadActuatorEffectOptions> {
    id: number;
}

export interface GamepadInputEvents {
    disconnected: IGamepadInput;
    actuatorEffectStarted: GamepadActuatorEffect;
    actuatorEffectFinished: GamepadActuatorEffect;
}

export interface IGamepadInput extends IEmitter<GamepadInputEvents> {
    readonly native: Gamepad;
    readonly id: this['native']['id'];
    readonly index: this['native']['index'];
    readonly connected: this['native']['connected'];
    readonly axes: this['native']['axes'];
    readonly buttons: this['native']['buttons'];
    readonly hasHapticActuator: boolean;

    playEffect(options: GamepadActuatorEffectOptions): GamepadActuatorEffect | null;
}
