import { ISerializable } from "../serialization";
import { Component, SerializableComponent } from "./component";

export interface SerializableBehaviour extends SerializableComponent {
    isActive: boolean;
}

/**
 * Base class for Components that can be enabled/disabled
 */
export class Behaviour extends Component implements ISerializable<SerializableBehaviour> {
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
            isActive: this._isActive
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