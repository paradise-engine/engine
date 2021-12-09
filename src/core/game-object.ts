import { isInstanceOf } from "../util";
import { MultipleTransformsError } from "../errors";
import { applySerializable, deserialize, getSerializableComponentClass, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { Component, ComponentConstructor, SerializableComponent } from "./component";
import { __ComponentCreationLock } from "./component-creation-lock";
import { ManagedObject } from "./managed-object";
import { SerializableTransform, Transform } from "./transform";

export interface SerializableGameObject extends SerializableObject {
    name: string;
    id: string;
    isActive: boolean;
    transform: SerializableTransform;
    components: SerializableComponent[];
    children: SerializableGameObject[];
}

/**
 * Base class for any game object.
 */
export class GameObject extends ManagedObject implements ISerializable<SerializableGameObject> {

    public static fromSerializable(s: SerializableGameObject) {
        const obj = new GameObject(s.name);
        obj._id = s.id;
        obj._isActive = s.isActive;

        applySerializable(s.transform, obj._transform);
        for (const comp of s.components) {
            const ctor = getSerializableComponentClass(comp._ctor);
            try {
                const compInstance = obj.addComponent(ctor);
                applySerializable(comp, compInstance);
            } catch (err) {
                // avoid crashing because another transform is being added to object
                if (!(err instanceof MultipleTransformsError)) {
                    throw err;
                }
            }
        }

        for (const child of s.children) {
            const childObject: GameObject = deserialize(child);
            obj.addChild(childObject);
        }

        return obj;
    }

    /**
     * Returns all currently loaded GameObjects
     */
    public static override getAllLoadedObjects() {
        return super.getAllLoadedObjects()
            .filter((obj): obj is GameObject => obj instanceof GameObject);
    }

    private _components: Component[] = [];

    // internal representation of the active field
    protected _isActive: boolean = true;
    protected _transform: Transform;

    public name: string;

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
        super();
        this.name = name || 'EmptyObject';
        this._transform = this.addComponent(Transform);
    }

    public addComponent<T extends Component>(componentType: ComponentConstructor<T>): T {
        if (
            (componentType.prototype instanceof Transform || componentType === Transform as any)
            && this._transform !== undefined
        ) {
            throw new MultipleTransformsError();
        }

        __ComponentCreationLock.unlockComponentCreation();
        const component = new componentType(this);
        __ComponentCreationLock.lockComponentCreation();

        this._components.push(component);
        return component;
    }

    public removeComponent<T extends Component>(component: T) {
        const componentIndex = this._components.indexOf(component);
        if (componentIndex !== -1) {
            const del = this._components.splice(componentIndex, 1);
            del[0].destroy();
        }
    }

    public getAllComponents() {
        return this._components.concat([]);
    }

    /**
     * Returns all attached Component (if any) of the specified type.
     * @param componentType The Component type
     * @param strict If `true`, only Components that are the exact specified type are returned. Otherwise, also inheriting types qualify _(default)_.
     */
    public getComponents<T extends Component>(componentType: ComponentConstructor<T>, strict?: boolean) {
        return this._components.filter((comp): comp is T => isInstanceOf(comp, componentType, strict));
    }

    /**
     * Returns the first attached Component (if any) of the specified type.
     * @param componentType The Component type
     * @param strict If `true`, only Components that are the exact specified type are returned. Otherwise, also inheriting types qualify _(default)_.
     */
    public getComponent<T extends Component>(componentType: ComponentConstructor<T>, strict?: boolean) {
        const comps = this.getComponents(componentType, strict);
        if (comps.length > 0) {
            return comps[0];
        }

        return undefined;
    }

    public enable() {
        this._isActive = true;
    }

    public disable() {
        this._isActive = false;
    }

    public getChildren() {
        return this.transform.children
            .map(c => c.gameObject);
    }

    public getParent() {
        return this._transform.parent?.gameObject;
    }

    public addChild(child: GameObject) {
        this.transform.addChild(child.transform);
    }

    public removeChild(child: GameObject) {
        this.transform.removeChild(child.transform);
    }

    public destroy() {
        if (!this.isDestroyed) {
            super.destroy();
            this._transform.children.forEach(c => c.gameObject.destroy());
            this.getAllComponents().forEach(c => c.destroy());
        }
    }

    public getSerializableObject(): SerializableGameObject {
        return {
            _ctor: GameObject.name,
            id: this.id,
            transform: this._transform.getSerializableObject(),
            isActive: this._isActive,
            components: this._components.map(c => c.getSerializableObject()),
            name: this.name,
            children: this.getChildren().map(c => c.getSerializableObject())
        }
    }

}

registerDeserializable(GameObject);