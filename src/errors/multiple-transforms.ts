import { ParadiseError } from "./paradise-error";

export class MultipleTransformsError extends ParadiseError {
	constructor(message?: string) {
		super(message || 'Cannot add more than one Transform component to a GameObject');
	}
}