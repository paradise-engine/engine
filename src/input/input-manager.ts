import { MicroEmitter } from "../util";
import { GamepadInput } from "./gamepad-input";
import { IInputManager, InputManagerEvents } from "./i-input-manager";
import { KeyboardInput } from "./keyboard-input";
import { MouseInput } from "./mouse-input";

export class InputManager extends MicroEmitter<InputManagerEvents> implements IInputManager {
    public readonly mouse: MouseInput | null = null;
    public readonly keyboard: KeyboardInput;
    public readonly gamepads: Map<number, GamepadInput> = new Map();

    private _gamepadConnectedHandler = (ev: GamepadEvent) => {
        if (!this.gamepads.has(ev.gamepad.index)) {
            this._setUpGamepad(ev.gamepad);
        }
    }

    constructor() {
        super();

        // mouse challenge
        if (matchMedia('(pointer:fine)')) {
            this.mouse = new MouseInput();
        }

        this.keyboard = new KeyboardInput();

        const gamepads = window.navigator.getGamepads();
        for (const gamepad of gamepads) {
            if (gamepad !== null) {
                this._setUpGamepad(gamepad);
            }
        }

        window.addEventListener('gamepadconnected', this._gamepadConnectedHandler);
    }

    private _setUpGamepad(gamepad: Gamepad) {
        const input = new GamepadInput(gamepad);
        this.gamepads.set(gamepad.index, input);
        this.emit('gamepadConnected', input);

        input.once('disconnected', input => {
            this.gamepads.delete(input.index);
            this.emit('gamepadDisconnected', input);
        });
    }

    public getGamepadByIndex(index: number) {
        const gamepad = this.gamepads.get(index);
        if (!gamepad) {
            return null;
        }
        return gamepad;
    }
}
