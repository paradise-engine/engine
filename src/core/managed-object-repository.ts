import { ManagedObjectNotFoundError, UnknownDeserializableError } from "../errors";
import { DeserializationOptions, deserialize, ISerializable, isSerializableComponentClass, registerDeserializable, SerializableObject } from "../serialization";
import { MicroEmitter } from "../util";
import { Component } from "./component";
import { GameObject } from "./game-object";
import type { ManagedObject } from "./managed-object";

interface ObjectRepositoryEvents {
    idChanged: { oldId: string, newId: string }
}

export interface SerializableManagedObjectRepository extends SerializableObject {
    objectMap: { [key: string]: SerializableObject };
    componentObjectMap: { [key: string]: string };
}

export class ManagedObjectRepository extends MicroEmitter<ObjectRepositoryEvents> implements ISerializable<SerializableManagedObjectRepository> {
    public static fromSerializable(s: SerializableManagedObjectRepository, options: DeserializationOptions) {
        const repo = new ManagedObjectRepository();

        options.application['_managedObjectRepository'] = repo;

        for (const key of Object.keys(s.objectMap)) {
            if (s.objectMap.hasOwnProperty(key)) {
                try {
                    repo._objectMap.set(key, deserialize(s.objectMap[key], options) as unknown as ManagedObject)
                } catch (err) {
                    // catch UnknownDeserializableError for components
                    if (!(err instanceof UnknownDeserializableError)) {
                        throw err;
                    }

                    if (!isSerializableComponentClass(s.objectMap[key]._ctor)) {
                        throw err;
                    }
                }

            }
        }

        for (const key of Object.keys(s.componentObjectMap)) {
            if (s.componentObjectMap.hasOwnProperty(key)) {
                repo._componentObjectMap.set(key, s.componentObjectMap[key]);
            }
        }

        return repo;
    }

    // map that holds all currently loaded managed objects
    private _objectMap: Map<string, ManagedObject> = new Map();

    // map that holds the mapping between component ids and game object ids;
    private _componentObjectMap: Map<string, string> = new Map();

    /**
     * Changes an object's ID and re-maps the object with the new ID.
     * @param obj The object to change the ID of
     * @param id The object's new ID
     */
    public changeId(obj: ManagedObject, id: string) {
        const oldId = obj.id;

        if (obj.id !== id) {
            const existing = this._objectMap.get(id);
            if (existing) {
                existing.destroy();
                this._componentObjectMap.forEach((val, key) => {
                    if (val === id || key === id) {
                        this._componentObjectMap.delete(key);
                    }
                });
            }

            this._objectMap.delete(oldId);
            obj['_id'] = id;
            this._objectMap.set(obj.id, obj);

            this._componentObjectMap.forEach((val, key) => {
                if (val === oldId) {
                    this._componentObjectMap.set(key, id);
                } else if (key === oldId) {
                    this._componentObjectMap.set(id, val);
                }
            });

            this.emit('idChanged', { oldId, newId: id });
        }
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

    public getSerializableObject(): SerializableManagedObjectRepository {
        const objectMap: { [key: string]: SerializableObject } = {};

        this._objectMap.forEach((value, key) => {
            objectMap[key] = (value as unknown as ISerializable<SerializableObject>).getSerializableObject();
        });

        const componentObjectMap: { [key: string]: string } = {};

        this._componentObjectMap.forEach((value, key) => {
            componentObjectMap[key] = value;
        });

        return {
            _ctor: ManagedObjectRepository.name,
            objectMap,
            componentObjectMap
        }
    }
}

registerDeserializable(ManagedObjectRepository);