import { ParadiseError } from "./paradise-error";

export class DuplicateGameObjectError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = DuplicateGameObjectError.name;
    }
}