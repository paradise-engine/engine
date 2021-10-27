import { ParadiseError } from "./paradise-error";

export class ObjectNotFoundError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = ObjectNotFoundError.name;
    }
}