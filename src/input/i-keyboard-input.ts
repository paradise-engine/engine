import { IEmitter } from "../util";

export interface KeyboardInputEvents {
    layoutMapLoaded: KeyboardLayoutMap;
    keyDown: KeyboardEventCode;
    keyUp: KeyboardEventCode;
}

export interface IKeyboardInput extends IEmitter<KeyboardInputEvents> {
    /**
     * Indicates whether platform supports the native
     * `Keyboard` API. If this is false, `KeyboardInput.native`
     * will return `undefined`.
     */
    readonly hasNativeKeyboard: boolean;

    /**
     * Returns the native `Keyboard` object. Returns `undefined`
     * if platform does not support native Keyboard API.
     */
    readonly native: Keyboard | undefined;

    /**
     * Returns the `KeyboardLayoutMap` from the native 'Keyboard' object.
     * Will return `undefined` if the object is not loaded yet or if the
     * platform does not support native Keyboard API.
     */
    readonly keyboardLayoutMap: KeyboardLayoutMap | undefined;

    /**
     * Indicates whether loading the `KeyboardLayoutMap` from the native
     * `Keyboard` object is finished yet. Will always return `false` on
     * platforms that do not support native Keyboard API.
     */
    readonly layoutMapReady: boolean;

    isKeyPressed(code: KeyboardEventCode): boolean;
    getAllPressedKeys(): KeyboardEventCode[];
}