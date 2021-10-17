import { ParadiseError } from "./paradise-error";

export class ManagedObjectDestroyedError extends ParadiseError {
	constructor(message?: string, innerError?: Error) {
		super(message || 'Cannot access managed object', innerError);
		this.name = ManagedObjectDestroyedError.name;
	}
}