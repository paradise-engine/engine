declare global {

    /**
     * [UI Events KeyboardEvent code Values](https://www.w3.org/TR/uievents-code/#keyboard-key-codes)
     */
    type KeyboardEventCode =
        // Code values for writing system keys in the Alphanumeric section.
        | 'Backquote'
        | 'Backslash'
        | 'Backspace'
        | 'BracketLeft'
        | 'BracketRight'
        | 'Comma'
        | 'Digit0'
        | 'Digit1'
        | 'Digit2'
        | 'Digit3'
        | 'Digit4'
        | 'Digit5'
        | 'Digit6'
        | 'Digit7'
        | 'Digit8'
        | 'Digit9'
        | 'Equal'
        | 'IntlBackslash'
        | 'IntlRo'
        | 'IntlYen'
        | 'KeyA'
        | 'KeyB'
        | 'KeyC'
        | 'KeyD'
        | 'KeyE'
        | 'KeyF'
        | 'KeyG'
        | 'KeyH'
        | 'KeyI'
        | 'KeyJ'
        | 'KeyK'
        | 'KeyL'
        | 'KeyM'
        | 'KeyN'
        | 'KeyO'
        | 'KeyP'
        | 'KeyQ'
        | 'KeyR'
        | 'KeyS'
        | 'KeyT'
        | 'KeyU'
        | 'KeyV'
        | 'KeyW'
        | 'KeyX'
        | 'KeyY'
        | 'KeyZ'
        | 'Minus'
        | 'Period'
        | 'Quote'
        | 'Semicolon'
        | 'Slash'
        // Code values for functional keys in the Alphanumeric section.
        | 'AltLeft'
        | 'AltRight'
        | 'CapsLock'
        | 'ContextMenu'
        | 'ControlLeft'
        | 'ControlRight'
        | 'Enter'
        | 'MetaLeft'
        | 'MetaRight'
        | 'ShiftLeft'
        | 'ShiftRight'
        | 'Space'
        | 'Tab'
        // Code values for functional keys found on Japanese and Korean keyboards.
        | 'Convert'
        | 'KanaMode'
        | 'Lang1'
        | 'Lang2'
        | 'Lang3'
        | 'Lang4'
        | 'Lang5'
        | 'NonConvert'
        // Code values for keys in the ControlPad section.
        | 'Delete'
        | 'End'
        | 'Help'
        | 'Home'
        | 'Insert'
        | 'PageDown'
        | 'PageUp'
        // Code values for keys in the ArrowPad section.
        | 'ArrowDown'
        | 'ArrowLeft'
        | 'ArrowRight'
        | 'ArrowUp'
        // Code values for keys in the Numpad section.
        | 'NumLock'
        | 'Numpad0'
        | 'Numpad1'
        | 'Numpad2'
        | 'Numpad3'
        | 'Numpad4'
        | 'Numpad5'
        | 'Numpad6'
        | 'Numpad7'
        | 'Numpad8'
        | 'Numpad9'
        | 'NumpadAdd'
        | 'NumpadBackspace'
        | 'NumpadClear'
        | 'NumpadClearEntry'
        | 'NumpadComma'
        | 'NumpadDecimal'
        | 'NumpadDivide'
        | 'NumpadEnter'
        | 'NumpadEqual'
        | 'NumpadHash'
        | 'NumpadMemoryAdd'
        | 'NumpadMemoryClear'
        | 'NumpadMemoryRecall'
        | 'NumpadMemoryStore'
        | 'NumpadMemorySubtract'
        | 'NumpadMultiply'
        | 'NumpadParenLeft'
        | 'NumpadParenRight'
        | 'NumpadStar'
        | 'NumpadSubtract'
        // Code values for keys in the Function section.
        | 'Escape'
        | 'F1'
        | 'F2'
        | 'F3'
        | 'F4'
        | 'F5'
        | 'F6'
        | 'F7'
        | 'F8'
        | 'F9'
        | 'F10'
        | 'F11'
        | 'F12'
        | 'Fn'
        | 'FnLock'
        | 'PrintScreen'
        | 'ScrollLock'
        | 'Pause'
        // Code values for media keys.
        | 'BrowserBack'
        | 'BrowserFavorites'
        | 'BrowserForward'
        | 'BrowserHome'
        | 'BrowserRefresh'
        | 'BrowserSearch'
        | 'BrowserStop'
        | 'Eject'
        | 'LaunchApp1'
        | 'LaunchApp2'
        | 'LaunchMail'
        | 'MediaPlayPause'
        | 'MediaSelect'
        | 'MediaStop'
        | 'MediaTrackNext'
        | 'MediaTrackPrevious'
        | 'Power'
        | 'Sleep'
        | 'AudioVolumeDown'
        | 'AudioVolumeMute'
        | 'AudioVolumeUp'
        | 'WakeUp'

    interface KeyboardLayoutMap {
        /**
         * Returns an array of a given object's own enumerable property `[key, value]` pairs,
         * in the same order as that provided by a `for...in` loop (the difference being that a
         * `for-in` loop enumerates properties in the prototype chain as well).
         */
        entries(): Iterator<[string, string]>;
        /**
         * Returns a new _array iterator_ object that contains the keys for each index in the array.
         */
        keys(): Iterator<string>;
        /**
         * Returns the number of elements in the `KeyboardLayoutMap` object.
         */
        size: number;
        /**
         * Returns a new _array iterator_ object that contains the values for each index in the
         * `KeyboardLayoutMap` object.
         */
        values(): Iterator<string>;
        /**
         * Returns the element with the given key from the `KeyboardLayoutMap` object.
         * @param key The key of the item to return from the map.
         */
        get(key: string): string;
        /**
         * Returns a boolean indicating whether the `KeyboardLayoutMap` object has an element
         * with the specified key.
         * @param key The key of an element to search for in the map.
         */
        has(key: string): boolean;
    }

    interface Keyboard {
        /**
         * Returns a `Promise` that resolves with an instance of `KeyboardLayoutMap` which is a
         * map-like object with functions for retrieving the strings associated with specific
         * physical keys.
         */
        getLayoutMap(): Promise<KeyboardLayoutMap>;
        /**
         * Returns a `Promise` after enabling the capture of keypresses for any or all of the keys
         * on the physical keyboard.
         * @param keyCodes An `Array` of one or more key codes to lock. If no keycodes are provided all keys will be locked. A list of valid code values is found in the `UI Events KeyboardEvent code Values` spec.
         */
        lock(keyCodes?: KeyboardEventCode[]): Promise<void>;
        /**
         * Unlocks all keys captured by the lock() method and returns synchronously.
         */
        unlock(): void;
    }

    interface Navigator {
        /**
         * Returns a `Keyboard` object which provides access to functions that retrieve
         * keyboard layout maps and toggle capturing of key presses from the physical keyboard.
         */
        readonly keyboard: Keyboard;
    }
}

export { }