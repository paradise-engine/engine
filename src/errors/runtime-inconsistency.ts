import { CoreError } from "./core-error";

export class RuntimeInconsistencyError extends CoreError {
	constructor(message: string) {
		super(message);
	}
}