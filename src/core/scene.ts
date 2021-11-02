import { DuplicateGameObjectError, HierarchyInconsistencyError, ObjectNotFoundError } from "../errors";
import { deserialize, ISerializable, SerializableObject } from "../serialization";
import { Indexable } from "../util";
import { GameObject, SerializableGameObject } from "./game-object";

export interface SerializableScene extends SerializableObject {
    name: string;
    gameObjects: SerializableGameObject[];
}

export class Scene implements ISerializable<SerializableScene> {

    public static fromSerializable(s: SerializableScene) {
        const scene = new Scene(s.name);
        for (const obj of s.gameObjects) {
            const gameObject: GameObject = deserialize(obj);
            scene.addGameObject(gameObject);
        }

        return scene;
    }

    private static _nextId = 0;
    private static _scenes: Indexable<Scene> = {};

    public static getSceneById(id: number): Scene | undefined {
        return this._scenes[id];
    }

    private _gameObjects: GameObject[] = [];

    public readonly id: number;
    public name: string;

    constructor(name: string) {
        this.id = Scene._nextId++;
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
            gameObjects: this._gameObjects.map(go => go.getSerializableObject())
        }
    }
}