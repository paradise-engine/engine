import { Application } from "../application";
import { generateRandomString } from "../util";

/**
 * Base class for managed objects
 * that can be destroyed.
 */
export abstract class ManagedObject {
	private _isDestroyed = false;
	protected _id: string;

	public get id() {
		return this._id;
	}

	public get application() {
		return Application.instance;
	}

	public get isDestroyed() {
		return this._isDestroyed;
	}

	constructor() {
		this._id = generateRandomString();
		this.application.managedObjectRepository['_objectMap'].set(this.id, this);

		// Object.defineProperty(this, '_application', { enumerable: false });
	}

	public destroy() {
		if (!this._isDestroyed) {
			this._isDestroyed = true;
			this.application.managedObjectRepository['_objectMap'].delete(this.id);
		}
	}
}