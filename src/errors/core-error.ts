export class CoreError extends Error {

	constructor(message?: string) {
		super(message || 'An unexpected engine error occurred');
	}

}