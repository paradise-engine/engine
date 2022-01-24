import { Vector } from "../data-structures";
import { IRenderPipelineView } from "../graphics";
import { IEmitter } from "../util";

export enum MouseInputButton {
    primary = 'primary',
    secondary = 'secondary',
    auxiliary = 'auxiliary',
    mouse4 = 'mouse4',
    mouse5 = 'mouse5'
}

interface MIButtonsState {
    primary: boolean;
    secondary: boolean;
    auxiliary: boolean;
    mouse4: boolean;
    mouse5: boolean;
}

export type MouseInputButtonsState = Readonly<MIButtonsState>;

export interface MouseInputState {
    readonly screenPos: Vector;
    readonly clientPos: Vector;
    readonly viewPos: Vector;
    readonly buttons: MouseInputButtonsState;
    readonly triggerButton: MouseInputButton;
}

export interface MouseInputMoveEvent extends MouseInputState {
    readonly delta: Vector;
}

export interface MouseInputEvents {
    'move': MouseInputMoveEvent;
    'down': MouseInputState;
    'up': MouseInputState;
    'wheelup': void;
    'wheeldown': void;
}

export interface IMouseInput extends IEmitter<MouseInputEvents> {
    readonly state: MouseInputState;
    readonly view: IRenderPipelineView;
}