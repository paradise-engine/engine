import { DuplicateGameObjectError, HierarchyInconsistencyError, ObjectNotFoundError } from "../errors";
import { deserialize, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { Dictionary, generateRandomString } from "../util";
import { GameObject, SerializableGameObject } from "./game-object";

export interface SerializableScene extends SerializableObject {
    name: string;
    id: string;
    gameObjects: SerializableGameObject[];
}

export class Scene implements ISerializable<SerializableScene> {

    public static fromSerializable(s: SerializableScene) {
        const scene = new Scene(s.name);
        delete Scene._scenes[scene.id];
        scene._id = s.id;

        Scene._scenes[scene._id] = scene;

        for (const obj of s.gameObjects) {
            const gameObject: GameObject = deserialize(obj);
            scene.addGameObject(gameObject);
        }

        return scene;
    }

    private static _scenes: Dictionary<Scene> = {};

    public static getSceneById(id: string): Scene | undefined {
        return this._scenes[id];
    }

    private _gameObjects: GameObject[] = [];
    private _id: string;

    public get id() {
        return this._id;
    }

    public name: string;

    constructor(name: string) {
        this._id = generateRandomString();
        this.name = name;
        Scene._scenes[this.id] = this;
    }

    public getAllGameObjects() {
        return this._gameObjects.slice();
    }

    public addGameObject(obj: GameObject) {
        if (this._gameObjects.indexOf(obj) !== -1) {
            throw new DuplicateGameObjectError(`Cannot add GameObject: GameObject '${obj.name}' already exists in scene '${this.name}' (${this.id})`);
        }

        if (obj.getParent() !== undefined) {
            throw new HierarchyInconsistencyError(`Cannot add GameObject: GameObject '${obj.name}' is a child of another GameObject`);
        }

        this._gameObjects.push(obj);
    }

    public removeGameObject(obj: GameObject) {
        const index = this._gameObjects.indexOf(obj);
        if (index === -1) {
            throw new ObjectNotFoundError(`Cannot remove GameObject: GameObject '${obj.name}' does not exist in scene '${this.name}' (${this.id})`);
        }

        this._gameObjects.splice(index, 1);
    }

    public removeGameObjectAt(index: number) {
        if (this._gameObjects[index] === undefined) {
            throw new ObjectNotFoundError(`Cannot remove GameObject at index ${index}: There is no GameObject at index ${index} in scene '${this.name}' (${this.id})`);
        }

        this._gameObjects.splice(index, 1);
    }

    public moveGameObject(fromIndex: number, toIndex: number) {
        this._gameObjects.splice(toIndex, 0, this._gameObjects.splice(fromIndex, 1)[0]);
    }

    public getSerializableObject(): SerializableScene {
        return {
            _ctor: Scene.name,
            name: this.name,
            id: this.id,
            gameObjects: this._gameObjects.map(go => go.getSerializableObject())
        }
    }
}

registerDeserializable(Scene);