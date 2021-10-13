import { MultipleTransformsError } from "../errors";
import { Component, ComponentConstructor } from "./component";
import { __ComponentCreationLock } from "./component-creation-lock";
import { ManagedObject } from "./managed-object";
import { Transform } from "./transform";

/**
 * Base class for any game object.
 */
export class GameObject extends ManagedObject {

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
        return this._components.filter((comp): comp is T => {
            if (strict) {
                return comp.constructor === componentType;
            } else {
                return comp instanceof componentType;
            }
        });
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
            this._components.forEach(c => c.destroy());
        }
    }

}