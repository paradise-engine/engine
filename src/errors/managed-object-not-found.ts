import { ParadiseError } from "./paradise-error";

export class ManagedObjectNotFoundError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = ManagedObjectNotFoundError.name;
    }
}