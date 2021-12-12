import { ISerializable } from "../serialization";
import { Component, SerializableComponent } from "./component";

export interface SerializableBehaviour extends SerializableComponent {
    isActive: boolean;
    id: string;
}

/**
 * Base class for Components that can be enabled/disabled
 */
export class Behaviour extends Component implements ISerializable<SerializableBehaviour> {
    public static applySerializable(s: SerializableBehaviour, b: Behaviour) {
        b._isActive = s.isActive;
        this._changeId(b, s.id);
    }

    private _isActive: boolean = true;

    public get isActive() {
        return this._isActive;
    }

    public enable() {
        this._isActive = true;
    }

    public disable() {
        this._isActive = false;
    }

    public getSerializableObject(): SerializableBehaviour {
        return {
            _ctor: Behaviour.name,
            isActive: this._isActive,
            id: this.id
        }
    }

    // #region lifecycle methods

    public onAwake() { }
    public onEnable() { }
    public onStart() { }
    public onUpdate() { }
    public onPostUpdate() { }
    public onDestroy() { }
    public onDisable() { }

    // #endregion
}