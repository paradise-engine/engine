import { ManagedObjectDestroyedError, ManagedObjectNotFoundError, RuntimeInconsistencyError } from "../errors";
import { ISerializable, SerializableObject } from "../serialization";
import { __ComponentCreationLock } from "./component-creation-lock";
import type { GameObject } from "./game-object";
import { ManagedObject, ManagedObjectOptions } from "./managed-object";

export type ComponentConstructor<T extends Component> = {
	new(gameObject: GameObject, options?: ManagedObjectOptions): T;
	_isInternal?: boolean;
}

export interface SerializableComponent extends SerializableObject {
	id: string;
}

/**
 * Base class for everything that can be attached
 * to GameObjects.
 */
export abstract class Component extends ManagedObject implements ISerializable<SerializableComponent> {
	/**
	 * workaround to prevend edless loop between `destroy()`
	 * and GameObject's `removeComponent()` 
	 */
	private _markedForDestruction;

	public get gameObject() {
		if (this.isDestroyed) {
			throw new ManagedObjectDestroyedError();
		}

		const objId = this.application.managedObjectRepository['_componentObjectMap'].get(this.id);
		if (!objId) {
			throw new RuntimeInconsistencyError('Cannot get GameObject of orphaned Component');
		}

		return this.application.managedObjectRepository.getObjectById<GameObject>(objId);
	}

	public get transform() {
		return this.gameObject.transform;
	}

	constructor(gameObject: GameObject, options?: ManagedObjectOptions) {
		if (!__ComponentCreationLock.componentsMayBeCreated()) {
			throw new RuntimeInconsistencyError('Cannot create component: Component creation is locked');
		}

		super(options);
		this._markedForDestruction = false;
		this.application.managedObjectRepository['_componentObjectMap'].set(this.id, gameObject.id);
	}

	public override destroy() {
		if (!this._markedForDestruction) {
			this._markedForDestruction = true;

			try {
				this.gameObject.removeComponent(this);
			} catch (err) {
				if (!(err instanceof ManagedObjectNotFoundError)) {
					throw err;
				}
			}

			this.application.managedObjectRepository['_componentObjectMap'].delete(this.id);
			super.destroy();
		}
	}

	public abstract getSerializableObject(): SerializableComponent;

}