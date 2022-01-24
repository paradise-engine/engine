import { IEmitter } from "../util";
import { IGamepadInput } from "./i-gamepad-input";
import { IKeyboardInput } from "./i-keyboard-input";
import { IMouseInput } from "./i-mouse-input";

export interface InputManagerEvents {
    gamepadConnected: IGamepadInput;
    gamepadDisconnected: IGamepadInput;
}

export interface IInputManager extends IEmitter<InputManagerEvents> {
    readonly mouse: IMouseInput | null;
    readonly keyboard: IKeyboardInput;
    readonly gamepads: Map<number, IGamepadInput>;
    getGamepadByIndex(index: number): IGamepadInput | null;
}