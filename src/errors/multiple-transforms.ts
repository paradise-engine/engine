import { ParadiseError } from "./paradise-error";

export class MultipleTransformsError extends ParadiseError {
	constructor(message?: string, innerError?: Error) {
		super(message || 'Cannot add more than one Transform component to a GameObject', innerError);
		this.name = MultipleTransformsError.name;
	}
}