import { Vector } from "../core";
import { IRendererView } from "../renderer";
import { arrayPermutate, Indexable, MicroEmitter } from "../util";
import { IMouseInput, MouseInputButton, MouseInputButtonsState, MouseInputEvents, MouseInputState } from "./i-mouse-input";

interface MIButtonsState {
    primary: boolean;
    secondary: boolean;
    auxiliary: boolean;
    mouse4: boolean;
    mouse5: boolean;
}

const BUTTON_FLAGS: Indexable<MouseInputButton> = {
    1: MouseInputButton.primary,
    2: MouseInputButton.secondary,
    4: MouseInputButton.auxiliary,
    8: MouseInputButton.mouse4,
    16: MouseInputButton.mouse5,
}

const BUTTONS_FLAG_MAP: Indexable<MouseInputButtonsState> = {}

// populate buttons map by permutating possible flags
for (const combination of arrayPermutate(Object.keys(BUTTON_FLAGS).map(k => parseInt(k, 10)))) {
    const state: MIButtonsState = {
        primary: false,
        secondary: false,
        auxiliary: false,
        mouse4: false,
        mouse5: false
    }

    for (const flag of combination) {
        state[BUTTON_FLAGS[flag]] = true;
    }

    const combinedFlag = combination.reduce((previous, current) => previous + current, 0);
    const freezed: MouseInputButtonsState = Object.freeze(state);
    BUTTONS_FLAG_MAP[combinedFlag] = freezed;
}

export class MouseInput extends MicroEmitter<MouseInputEvents> implements IMouseInput {

    private _view: IRendererView;
    private _state: MouseInputState;

    public get state() {
        return this._state;
    }

    public get view() {
        return this._view;
    }

    private _handleMouseDown = (ev: MouseEvent) => {
        const data = this._updateState(ev);
        this.emit('down', data);
    }

    private _handleMouseUp = (ev: MouseEvent) => {
        const data = this._updateState(ev);
        this.emit('up', data);
    }

    private _handleMouseMove = (ev: MouseEvent) => {
        const data = this._updateState(ev);
        this.emit('move', {
            ...data,
            delta: new Vector(ev.movementX, ev.movementY)
        });
    }

    private _handleWheel = (ev: WheelEvent) => {
        if (ev.deltaY > 0) {
            this.emit('wheeldown');
        } else {
            this.emit('wheelup');
        }
    }

    constructor(view: IRendererView) {
        super();

        this._view = view;
        this._state = {
            screenPos: new Vector(-1, -1),
            clientPos: new Vector(-1, -1),
            viewPos: new Vector(-1, -1),
            buttons: {
                primary: false,
                secondary: false,
                auxiliary: false,
                mouse4: false,
                mouse5: false
            },
            triggerButton: MouseInputButton.primary
        }

        window.addEventListener('mousedown', this._handleMouseDown);
        window.addEventListener('mouseup', this._handleMouseUp);
        window.addEventListener('mousemove', this._handleMouseMove);
        window.addEventListener('wheel', this._handleWheel);
    }

    private _updateState(ev: MouseEvent) {
        const evData = this._extractEventData(ev);
        this._state = evData;
        return evData;
    }

    private _getButtonByNativeId(id: number): MouseInputButton {
        switch (id) {
            case 0: return MouseInputButton.primary;
            case 1: return MouseInputButton.auxiliary;
            case 2: return MouseInputButton.secondary;
            case 3: return MouseInputButton.mouse4;
            case 4: return MouseInputButton.mouse5;
            default: return MouseInputButton.primary;
        }
    }

    private _flagToButtons(flag: number): MouseInputButtonsState {
        const buttonsState = BUTTONS_FLAG_MAP[flag];

        if (flag === 0 || !buttonsState) {
            return Object.freeze({
                primary: false,
                secondary: false,
                auxiliary: false,
                mouse4: false,
                mouse5: false
            });
        }

        return buttonsState;
    }

    private _extractEventData(ev: MouseEvent): MouseInputState {
        const viewRect = this._view.getBoundingClientRect();
        return Object.freeze({
            screenPos: new Vector(ev.screenX, ev.screenY),
            clientPos: new Vector(ev.clientX, ev.clientY),
            viewPos: new Vector(ev.clientX - viewRect.x, ev.clientY - viewRect.y),
            triggerButton: this._getButtonByNativeId(ev.button),
            buttons: this._flagToButtons(ev.buttons)
        })
    }
}