import { CoreError } from "./core-error";

export class DestroyBoundTransformError extends CoreError {
	constructor(message?: string) {
		super(message || 'Cannot destroy a Transform component while its bound to a non-destroyed GameObject');
	}
}