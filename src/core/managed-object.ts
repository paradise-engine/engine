
/**
 * Base class for managed objects
 * that can be destroyed.
 */
export abstract class ManagedObject {
	private static _nextId = 0;
	// map that holds all currently loaded managed objects
	private static _objectMap: Map<number, ManagedObject> = new Map();

	/**
	 * Returns the loaded ManagedObject with the
	 * specified id
	 * @param id The id of the Object
	 */
	public static getObjectById(id: number) {
		return this._objectMap.get(id);
	}

	/**
	 * Returns all currently loaded ManagedObjects
	 */
	public static getAllLoadedObjects() {
		return Array.from(this._objectMap.values());
	}

	private _isDestroyed = false;

	public readonly id: number;

	public get isDestroyed() {
		return this._isDestroyed;
	}

	constructor() {
		this.id = ManagedObject._nextId++;
		ManagedObject._objectMap.set(this.id, this);
	}

	public destroy() {
		if (!this._isDestroyed) {
			this._isDestroyed = true;
			ManagedObject._objectMap.delete(this.id);
		}
	}
}