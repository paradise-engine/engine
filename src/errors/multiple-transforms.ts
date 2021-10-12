import { CoreError } from "./core-error";

export class MultipleTransformsError extends CoreError {
	constructor(message?: string) {
		super(message || 'Cannot add more than one Transform component to a GameObject');
	}
}