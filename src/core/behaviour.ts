import { IBehaviour } from "./i-behaviour";
import { ISerializable } from "../serialization";
import { Component, SerializableComponent } from "./component";

export interface SerializableBehaviour extends SerializableComponent {
    isActive: boolean;
    id: string;
}

/**
 * Base class for Components that can be enabled/disabled
 */
export class Behaviour extends Component implements ISerializable<SerializableBehaviour>, IBehaviour {
    public static applySerializable(s: SerializableBehaviour, b: Behaviour) {
        b._isActive = s.isActive;

        const compIdIndex = b.gameObject['_componentIds'].indexOf(b.id);
        b._application.managedObjectRepository.changeId(b, s.id);
        b.gameObject['_componentIds'][compIdIndex] = s.id;
    }

    private _isActive: boolean = true;

    public get isActive() {
        return this._isActive;
    }

    public enable() {
        if (this._isActive === false) {
            this._isActive = true;

            if (this.gameObject.isActive && this.gameObject.parentIsActive) {
                this.application.gameManager.currentScene?.notifyEnable(this.id);
                this.onEnable();
            }
        }
    }

    public disable() {
        if (this._isActive === true) {
            this._isActive = false;

            if (this.gameObject.isActive && this.gameObject.parentIsActive) {
                this.application.gameManager.currentScene?.notifyDisable(this.id);
                this.onDisable();
            }
        }
    }

    public getSerializableObject(): SerializableBehaviour {
        return {
            _ctor: Behaviour.name,
            isActive: this._isActive,
            id: this.id
        }
    }

    public override destroy() {
        this.onDestroy();
        super.destroy();
    }

    // #region lifecycle methods

    /**
     * Is called on instantiation.
     */
    public onAwake() { }

    /**
     * Is called when an object is enabled.
     */
    public onEnable() { }

    /**
     * Is called before the onUpdate function is called the first time
     * for an enabled object.
     */
    public onStart() { }

    /**
     * Is called every frame.
     */
    public onUpdate() { }

    /**
     * Is called on destroy.
     */
    public onDestroy() { }

    /**
     * Is called when object state is switched to inactive.
     */
    public onDisable() { }

    // #endregion
}