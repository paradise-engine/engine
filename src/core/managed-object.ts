import { Application } from "../application";
import { generateRandomString } from "../util";

/**
 * Base class for managed objects
 * that can be destroyed.
 */
export abstract class ManagedObject {
	private _isDestroyed = false;
	protected _id: string;
	protected _application: Application;

	public get id() {
		return this._id;
	}

	public get application() {
		return this._application;
	}

	public get isDestroyed() {
		return this._isDestroyed;
	}

	constructor(application: Application) {
		this._id = generateRandomString();
		this._application = application;
		this._application.managedObjectRepository['_objectMap'].set(this.id, this);

		// Object.defineProperty(this, '_application', { enumerable: false });
	}

	public destroy() {
		if (!this._isDestroyed) {
			this._isDestroyed = true;
			this._application.managedObjectRepository['_objectMap'].delete(this.id);
		}
	}
}