import { isInstanceOf, recursiveEvent } from "../util";
import { MultipleTransformsError } from "../errors";
import { applySerializable, DeserializationOptions, deserialize, getSerializableComponentClass, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { Component, ComponentConstructor, SerializableComponent } from "./component";
import { ManagedObject } from "./managed-object";
import { SerializableTransform, Transform } from "./transform";
import { Application } from "../application";
import { Behaviour } from "./behaviour";

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

    public static fromSerializable(s: SerializableGameObject, options: DeserializationOptions) {
        const obj = new GameObject(options.application, s.name);
        obj.application.managedObjectRepository.changeId(obj, s.id);
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
            const childObject: GameObject = deserialize(child, options);
            obj.addChild(childObject);
        }

        return obj;
    }

    private _componentIds: string[] = [];

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

    public get parentIsActive(): boolean {
        const parent = this.getParent();
        if (parent) {
            return parent.parentIsActive;
        }

        return this.isActive;
    }

    constructor(application: Application, name?: string) {
        super(application);
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

        this._application['__ccLock'].unlockComponentCreation();
        const component = new componentType(this._application, this);
        this._application['__ccLock'].lockComponentCreation();

        this._componentIds.push(component.id);

        if (component instanceof Behaviour) {
            component.onAwake();
            this.application.gameManager.currentScene?.notifyAwake(component.id);
        }

        return component;
    }

    public removeComponent<T extends Component>(component: T) {
        const componentIndex = this._componentIds.indexOf(component.id);
        if (componentIndex !== -1) {
            const del = this._componentIds.splice(componentIndex, 1);
            this._application.managedObjectRepository.getObjectById<Component>(del[0]).destroy();
        }
    }

    public getAllComponents() {
        return this._componentIds.map(cId => this._application.managedObjectRepository.getObjectById<Component>(cId));
    }

    /**
     * Returns all attached Component (if any) of the specified type.
     * @param componentType The Component type
     * @param strict If `true`, only Components that are the exact specified type are returned. Otherwise, also inheriting types qualify _(default)_.
     */
    public getComponents<T extends Component>(componentType: ComponentConstructor<T>, strict?: boolean) {
        return this.getAllComponents().filter((comp): comp is T => isInstanceOf(comp, componentType, strict));
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
        if (this._isActive === false) {
            this._isActive = true;

            if (this.parentIsActive) {
                this.application.gameManager.currentScene?.notifyEnable(this.id);
                recursiveEvent(this, 'onEnable');
            }
        }
    }

    public disable() {
        if (this._isActive === true) {
            this._isActive = false;

            if (this.parentIsActive) {
                this.application.gameManager.currentScene?.notifyDisable(this.id);
                recursiveEvent(this, 'onDisable');
            }
        }
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
            components: this._componentIds.map(cId => this._application.managedObjectRepository.getObjectById<Component>(cId).getSerializableObject()),
            name: this.name,
            children: this.getChildren().map(c => c.getSerializableObject())
        }
    }

}

registerDeserializable(GameObject);