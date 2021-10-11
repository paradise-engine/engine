import { Transform } from "./transform";

/**
 * Base class for any game object.
 */
export class GameObject {

    protected static _nextId = 0;
    // map that allows us to get which game object is associated to a transform
    protected static _transformMap = new WeakMap<Transform, GameObject>();

    public static getGameObjectByTransform(transform: Transform) {
        return this._transformMap.get(transform);
    }

    // internal representation of the active field
    protected _isActive: boolean = true;
    protected _transform: Transform;

    public name: string;
    public readonly id: number;

    public get transform() {
        return this._transform;
    }

    public get hasChildren() {
        return this.transform.children.length > 0;
    }

    public get isActive() {
        return this._isActive;
    }

    constructor(name?: string) {
        this.name = name || 'EmptyObject';
        this.id = GameObject._nextId++;

        this._transform = new Transform();

    }

    public enable() {
        this._isActive = true;
    }

    public disable() {
        this._isActive = false;
    }

    public getChildren(): GameObject[] {
        const children = this.transform.children
            .map(c => GameObject.getGameObjectByTransform(c));

        const notNullChildren: GameObject[] = [];
        children.forEach(c => {
            if (c !== undefined) {
                notNullChildren.push(c);
            }
        });

        return notNullChildren;
    }

    public getParent(): GameObject | undefined {
        return this._transform.parent ? GameObject.getGameObjectByTransform(this._transform.parent) : undefined;
    }

}