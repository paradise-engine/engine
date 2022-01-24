import { ParadiseError } from "./paradise-error";

export class LifecycleError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = LifecycleError.name;
    }
}