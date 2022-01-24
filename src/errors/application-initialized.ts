import { ParadiseError } from "./paradise-error";

export class ApplicationInitializedError extends ParadiseError {
    constructor(message?: string, innerError?: Error) {
        super(message || 'Application already initialized', innerError);
        this.name = ApplicationInitializedError.name;
    }
}