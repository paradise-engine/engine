import { Application } from "../application";
import { DuplicateGameObjectError, HierarchyInconsistencyError, ObjectNotFoundError } from "../errors";
import { DeserializationOptions, deserialize, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { arrayMove, Dictionary, generateRandomString, MicroEmitter } from "../util";
import { GameObject, SerializableGameObject } from "./game-object";

export interface SerializableScene extends SerializableObject {
    name: string;
    id: string;
    gameObjects: SerializableGameObject[];
}

interface SceneEvents {
    objectEnabled: string;
    objectDisabled: string;
}

export class Scene extends MicroEmitter<SceneEvents> implements ISerializable<SerializableScene> {

    public static fromSerializable(s: SerializableScene, options: DeserializationOptions) {
        const scene = new Scene(options.application, s.name);
        delete Scene._scenes[scene.id];
        scene._id = s.id;

        Scene._scenes[scene._id] = scene;

        for (const obj of s.gameObjects) {
            const gameObject: GameObject = deserialize(obj, options);
            scene.addGameObject(gameObject);
        }

        return scene;
    }

    private static _scenes: Dictionary<Scene> = {};

    public static getSceneById(id: string): Scene | undefined {
        return this._scenes[id];
    }

    private _gameObjectIds: string[] = [];
    private _id: string;
    private _application: Application;

    public get id() {
        return this._id;
    }

    public get application() {
        return this._application;
    }

    public name: string;

    constructor(application: Application, name: string) {
        super();
        this._id = generateRandomString();
        this._application = application;
        this.name = name;
        Scene._scenes[this.id] = this;

        this._application.managedObjectRepository.on('idChanged', (data) => {
            const gameObjectIndex = this._gameObjectIds.indexOf(data.oldId);
            if (gameObjectIndex !== -1) {
                this._gameObjectIds[gameObjectIndex] = data.newId;
            }
        });
    }

    public getAllGameObjects() {
        return this._gameObjectIds.map(goId => this._application.managedObjectRepository.getObjectById<GameObject>(goId));
    }

    public addGameObject(obj: GameObject) {
        if (this._gameObjectIds.indexOf(obj.id) !== -1) {
            throw new DuplicateGameObjectError(`Cannot add GameObject: GameObject ${obj.name} (${obj.id}) already exists in scene '${this.name}' (${this.id})`);
        }

        if (obj.getParent() !== undefined) {
            throw new HierarchyInconsistencyError(`Cannot add GameObject: GameObject '${obj.name}' is a child of another GameObject`);
        }

        this._gameObjectIds.push(obj.id);
    }

    public removeGameObject(obj: GameObject) {
        const index = this._gameObjectIds.indexOf(obj.id);
        if (index === -1) {
            throw new ObjectNotFoundError(`Cannot remove GameObject: GameObject ${obj.name} (${obj.id}) does not exist in scene '${this.name}' (${this.id})`);
        }

        this._gameObjectIds.splice(index, 1);
    }

    public removeGameObjectAt(index: number) {
        if (this._gameObjectIds[index] === undefined) {
            throw new ObjectNotFoundError(`Cannot remove GameObject at index ${index}: There is no GameObject at index ${index} in scene '${this.name}' (${this.id})`);
        }

        this._gameObjectIds.splice(index, 1);
    }

    public moveGameObject(fromIndex: number, toIndex: number) {
        this._gameObjectIds = arrayMove(this._gameObjectIds, fromIndex, toIndex);
    }

    public getSerializableObject(): SerializableScene {
        return {
            _ctor: Scene.name,
            name: this.name,
            id: this.id,
            gameObjects: this._gameObjectIds.map(goId => this._application.managedObjectRepository.getObjectById<GameObject>(goId).getSerializableObject())
        }
    }

    public notifyEnable(objectId: string) {
        this.emit('objectEnabled', objectId);
    }

    public notifyDisable(objectId: string) {
        this.emit('objectDisabled', objectId);
    }
}

registerDeserializable(Scene);