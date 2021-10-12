import { CoreError } from "./core-error";

export class ManagedObjectDestroyedError extends CoreError {
	constructor(message?: string) {
		super(message || 'Cannot access managed object');
	}
}