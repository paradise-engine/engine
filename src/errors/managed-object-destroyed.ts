import { ParadiseError } from "./paradise-error";

export class ManagedObjectDestroyedError extends ParadiseError {
	constructor(message?: string) {
		super(message || 'Cannot access managed object');
	}
}