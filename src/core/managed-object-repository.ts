import { ManagedObjectNotFoundError } from "../errors";
import { Component } from "./component";
import { GameObject } from "./game-object";
import type { ManagedObject } from "./managed-object";

export class ManagedObjectRepository {

    // map that holds all currently loaded managed objects
    private _objectMap: Map<string, ManagedObject> = new Map();

    // map that holds the mapping between component ids and game object ids;
    private _componentObjectMap: Map<string, string> = new Map();

    public addObject(obj: ManagedObject) {
        const existing = this._objectMap.get(obj.id);
        if (existing) {
            if (existing === obj) {
                return;
            } else if (!existing.isDestroyed) {
                existing.destroy();
            }
        }

        this._objectMap.set(obj.id, obj);
    }

    /**
     * Returns the loaded ManagedObject with the
     * specified id
     * @param id The id of the Object
     */
    public getObjectById<T extends ManagedObject = ManagedObject>(id: string) {
        const obj = this._objectMap.get(id);
        if (!obj) {
            throw new ManagedObjectNotFoundError(`No object with id '${id}' registered`)
        }
        return obj as T;
    }

    /**
     * Returns all currently loaded ManagedObjects
     */
    public getAllLoadedObjects() {
        return Array.from(this._objectMap.values());
    }

    /**
     * Returns all currently loaded Components
     */
    public getAllLoadedComponents() {
        return this.getAllLoadedObjects()
            .filter((obj): obj is Component => obj instanceof Component)
    }

    /**
     * Returns all currently loaded GameObjects
     */
    public getAllLoadedGameObjects() {
        return this.getAllLoadedObjects()
            .filter((obj): obj is GameObject => obj instanceof GameObject)
    }
}
