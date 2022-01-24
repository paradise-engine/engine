import { isInstanceOf, MicroEmitter } from "../util";
import { MultipleTransformsError } from "../errors";
import { applySerializable, deserialize, getSerializableComponentClass, ISerializable, registerDeserializable, SerializableObject } from "../serialization";
import { Component, ComponentConstructor, SerializableComponent } from "./component";
import { ManagedObject, ManagedObjectOptions } from "./managed-object";
import { SerializableTransform, Transform } from "./transform";
import { Behaviour } from "./behaviour";
import { MouseInputMoveEvent, MouseInputState } from "../input";
import { recursiveEvent } from "./recursive-event";
import { InternalGizmoHandler } from "./internal-gizmo-handler";
import { __ComponentCreationLock } from "./component-creation-lock";

export interface SerializableGameObject extends SerializableObject {
    name: string;
    id: string;
    isActive: boolean;
    isSelected: boolean;
    transform: SerializableTransform;
    components: SerializableComponent[];
    children: SerializableGameObject[];
}

export type GameObjectEventPayload<T> = { event: T, gameObject: GameObject }

export interface GameObjectEvents {
    onMouseEnter: GameObjectEventPayload<MouseInputMoveEvent>;
    onMouseLeave: GameObjectEventPayload<MouseInputMoveEvent>;
    onMouseDown: GameObjectEventPayload<MouseInputState>;
    onMouseUp: GameObjectEventPayload<MouseInputState>;
}

export interface GameObjectOptions extends ManagedObjectOptions {
    name?: string;
    transformId?: string;
}

/**
 * Base class for any game object.
 */
export class GameObject extends ManagedObject implements ISerializable<SerializableGameObject> {

    public static fromSerializable(s: SerializableGameObject) {
        const obj = new GameObject({
            name: s.name,
            id: s.id
        });
        obj._isActive = s.isActive;
        obj._isSelected = s.isSelected;

        applySerializable(s.transform, obj._transform);

        for (const child of s.children) {
            const childObject: GameObject = deserialize(child);
            obj.addChild(childObject);
        }

        for (const comp of s.components) {
            const ctor = getSerializableComponentClass(comp._ctor);
            try {
                const compInstance = obj.addComponent(ctor, { id: comp.id });
                applySerializable(comp, compInstance);
            } catch (err) {
                // avoid crashing because another transform is being added to object
                if (!(err instanceof MultipleTransformsError)) {
                    throw err;
                }
            }
        }

        return obj;
    }

    private _isSelected = false;
    private _componentIds: string[] = [];

    // internal representation of the active field
    protected _isActive: boolean = true;
    protected _transform: Transform;

    public name: string;
    public readonly events: MicroEmitter<GameObjectEvents> = new MicroEmitter();

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

    private _handleMouseMove = (ev: MouseInputMoveEvent) => { }

    private _handleMouseDown = (ev: MouseInputState) => { }

    private _handleMouseUp = (ev: MouseInputState) => { }

    constructor(options: GameObjectOptions = {}) {
        super(options);
        this.name = options.name || 'EmptyObject';

        this._transform = this.addComponent(Transform, { id: options.transformId });

        if (this.application.editorMode === true) {
            this.addComponent(InternalGizmoHandler);
        }

        const inputManager = this.application.inputManager;
        if (inputManager.mouse) {
            inputManager.mouse.on('move', this._handleMouseMove);
            inputManager.mouse.on('down', this._handleMouseDown);
            inputManager.mouse.on('up', this._handleMouseUp);
        }
    }

    public addComponent<T extends Component>(componentType: ComponentConstructor<T>, options?: ManagedObjectOptions): T {
        if (
            (componentType.prototype instanceof Transform || componentType === Transform as any)
            && this._transform !== undefined
        ) {
            throw new MultipleTransformsError();
        }

        __ComponentCreationLock.unlockComponentCreation();
        const component = new componentType(this, options);
        __ComponentCreationLock.lockComponentCreation();

        this._componentIds.push(component.id);

        if (component instanceof Behaviour && this.application.gameManager.isRunning) {
            component.onAwake();
            this.application.gameManager.currentScene?.notifyAwake(component.id);
        }

        return component;
    }

    public removeComponent<T extends Component>(component: T) {
        const componentIndex = this._componentIds.indexOf(component.id);
        if (componentIndex !== -1) {
            const del = this._componentIds.splice(componentIndex, 1);
            const delId = del[0];
            this.application.managedObjectRepository.getObjectById<Component>(delId).destroy();
        }
    }

    private _getAllComponents(omitInternals: boolean) {
        let comps = this._componentIds
            .map(cId => this.application.managedObjectRepository.getObjectById<Component>(cId));

        if (omitInternals) {
            comps = comps.filter(comp => (comp.constructor as ComponentConstructor<any>)._isInternal !== true);
        }

        return comps;
    }

    public getAllComponents() {
        return this._getAllComponents(true);
    }

    /**
     * Returns all attached Component (if any) of the specified type.
     * @param componentType The Component type
     * @param strict If `true`, only Components that are the exact specified type are returned. Otherwise, also inheriting types qualify _(default)_.
     */
    public getComponents<T extends Component>(componentType: ComponentConstructor<T>, strict?: boolean) {
        return this._getAllComponents(false).filter((comp): comp is T => isInstanceOf(comp, componentType, strict));
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

            const parent = this.getParent();
            if (parent) {
                parent.removeChild(this);
            }

            const inputManager = this.application.inputManager;
            if (inputManager.mouse) {
                inputManager.mouse.off('move', this._handleMouseMove);
                inputManager.mouse.off('down', this._handleMouseDown);
                inputManager.mouse.off('up', this._handleMouseUp);
            }
        }
    }

    public getSerializableObject(): SerializableGameObject {
        return {
            _ctor: GameObject.name,
            id: this.id,
            transform: this._transform.getSerializableObject(),
            isActive: this._isActive,
            isSelected: this._isSelected,
            components: this._componentIds
                .filter(cId => (this.application.managedObjectRepository.getObjectById<Component>(cId).constructor as ComponentConstructor<any>)._isInternal !== true)
                .map(cId => this.application.managedObjectRepository.getObjectById<Component>(cId).getSerializableObject()),
            name: this.name,
            children: this.getChildren().map(c => c.getSerializableObject())
        }
    }

}

registerDeserializable(GameObject);