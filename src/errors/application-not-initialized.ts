import { ParadiseError } from "./paradise-error";

export class ApplicationNotInitializedError extends ParadiseError {
    constructor(message?: string, innerError?: Error) {
        super(message || 'Tried to access Application without initializing', innerError);
        this.name = ApplicationNotInitializedError.name;
    }
}