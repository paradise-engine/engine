import { ParadiseError } from "./paradise-error";

export class RuntimeInconsistencyError extends ParadiseError {
	constructor(message: string) {
		super(message);
	}
}