import { ManagedObjectDestroyedError, RuntimeInconsistencyError } from "../errors";
import { ISerializable, SerializableObject } from "../serialization";
import { __ComponentCreationLock } from "./component-creation-lock";
import { GameObject } from "./game-object";
import { ManagedObject } from "./managed-object";

export type ComponentConstructor<T extends Component> = new (gameObject: GameObject) => T;

export interface SerializableComponent extends SerializableObject { }

/**
 * Base class for everything that can be attached
 * to GameObjects.
 */
export abstract class Component extends ManagedObject implements ISerializable<SerializableComponent> {

	// Map that holds a reference to a GameObject id for each Component id
	private static _gameObjectMap: Map<string, string> = new Map();

	/**
	 * Returns all currently loaded Components
	 */
	public static override getAllLoadedObjects() {
		return super.getAllLoadedObjects()
			.filter((obj): obj is Component => obj instanceof Component);
	}

	/**
	 * workaround to prevend edless loop between `destroy()`
	 * and GameObject's `removeComponent()` 
	 */
	private _markedForDestruction;

	public get gameObject() {
		if (this.isDestroyed) {
			throw new ManagedObjectDestroyedError();
		}

		const objId = Component._gameObjectMap.get(this.id);
		if (!objId) {
			throw new RuntimeInconsistencyError('Cannot get GameObject of orphaned Component');
		}

		return GameObject.getObjectById(objId) as GameObject;
	}

	constructor(gameObject: GameObject) {
		if (!__ComponentCreationLock.componentsMayBeCreated()) {
			throw new RuntimeInconsistencyError('Cannot create component: Component creation is locked');
		}

		super();
		this._markedForDestruction = false;
		Component._gameObjectMap.set(this.id, gameObject.id);
	}

	public override destroy() {
		if (!this._markedForDestruction) {
			this._markedForDestruction = true;
			this.gameObject.removeComponent(this);
			Component._gameObjectMap.delete(this.id);
			super.destroy();
		}
	}

	public abstract getSerializableObject(): SerializableComponent;

}