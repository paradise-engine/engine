export class ParadiseError extends Error {

	public readonly innerError?: Error;

	constructor(message?: string, innerError?: Error) {
		super(message || 'An unexpected engine error occurred');
		this.innerError = innerError;
		this.name = ParadiseError.name;
	}

	public override toString() {
		return `${super.toString()}${this.innerError ? `(INNER ERROR: ${this.innerError.toString()})` : ''}`;
	}
}