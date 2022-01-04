import { MicroEmitter } from "../util";
import { IKeyboardInput, KeyboardInputEvents } from "./i-keyboard-input";

export class KeyboardInput extends MicroEmitter<KeyboardInputEvents> implements IKeyboardInput {
    private _nativeKeyboard?: Keyboard;
    private _keyboardLayoutMap?: KeyboardLayoutMap;
    private _layoutMapReady = false;

    private _pressedKeyCodes: Set<KeyboardEventCode> = new Set();

    /**
     * Indicates whether platform supports the native
     * `Keyboard` API. If this is false, `KeyboardInput.native`
     * will return `undefined`.
     */
    public get hasNativeKeyboard() {
        return this._nativeKeyboard !== undefined;
    }

    /**
     * Returns the native `Keyboard` object. Returns `undefined`
     * if platform does not support native Keyboard API.
     */
    public get native() {
        return this._nativeKeyboard;
    }

    /**
     * Returns the `KeyboardLayoutMap` from the native 'Keyboard' object.
     * Will return `undefined` if the object is not loaded yet or if the
     * platform does not support native Keyboard API.
     */
    public get keyboardLayoutMap() {
        return this._keyboardLayoutMap;
    }

    /**
     * Indicates whether loading the `KeyboardLayoutMap` from the native
     * `Keyboard` object is finished yet. Will always return `false` on
     * platforms that do not support native Keyboard API.
     */
    public get layoutMapReady() {
        return this._layoutMapReady;
    }

    private _handleKeyDown = (ev: KeyboardEvent) => {
        const code = ev.code as KeyboardEventCode;
        this._pressedKeyCodes.add(code);
        this.emit('keyDown', code);
    }
    private _handleKeyUp = (ev: KeyboardEvent) => {
        const code = ev.code as KeyboardEventCode;
        this._pressedKeyCodes.delete(code);
        this.emit('keyUp', code);
    }

    constructor() {
        super();

        if (navigator.keyboard) {
            this._nativeKeyboard = navigator.keyboard;
            this._nativeKeyboard.getLayoutMap().then(map => {
                this._keyboardLayoutMap = map;
                this._layoutMapReady = true;
                this.emit('layoutMapLoaded', map);
            });
        }

        window.addEventListener('keydown', this._handleKeyDown);
        window.addEventListener('keyup', this._handleKeyUp);
    }

    public isKeyPressed(code: KeyboardEventCode) {
        return this._pressedKeyCodes.has(code);
    }

    public getAllPressedKeys() {
        return Array.from(this._pressedKeyCodes.keys());
    }
}