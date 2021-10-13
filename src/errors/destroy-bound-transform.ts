import { ParadiseError } from "./paradise-error";

export class DestroyBoundTransformError extends ParadiseError {
	constructor(message?: string) {
		super(message || 'Cannot destroy a Transform component while its bound to a non-destroyed GameObject');
	}
}