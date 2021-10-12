import { ManagedObjectDestroyedError, RuntimeInconsistencyError } from "../errors";
import { __ComponentCreationLock } from "./component-creation-lock";
import { GameObject } from "./game-object";
import { ManagedObject } from "./managed-object";

export type ComponentConstructor<T extends Component> = new (gameObject: GameObject) => T;

/**
 * Base class for everything that can be attached
 * to GameObjects.
 */
export abstract class Component extends ManagedObject {

	// WeakMap that holds a reference to a GameObject for each Component
	private static _gameObjectMap: WeakMap<Component, GameObject> = new WeakMap();

	/**
	 * Returns all currently loaded Components
	 */
	public static override getAllLoadedObjects() {
		return super.getAllLoadedObjects()
			.filter((obj): obj is Component => obj instanceof Component);
	}

	public get gameObject() {
		if (this.isDestroyed) {
			throw new ManagedObjectDestroyedError();
		}

		const obj = Component._gameObjectMap.get(this);
		if (!obj) {
			throw new RuntimeInconsistencyError('Cannot get GameObject of orphaned Component');
		}

		return obj;
	}

	constructor(gameObject: GameObject) {
		if (!__ComponentCreationLock.componentsMayBeCreated()) {
			throw new RuntimeInconsistencyError('Cannot create component: Component creation is locked');
		}

		super();
		Component._gameObjectMap.set(this, gameObject);
	}

	public override destroy() {
		this.gameObject.removeComponent(this);
		Component._gameObjectMap.delete(this);
		super.destroy();
	}

}