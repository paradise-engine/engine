import { ParadiseError } from "./paradise-error";

export class AbstractRendererError extends ParadiseError {
    constructor(message?: string, innerError?: Error) {
        super(message || 'Cannot render abstract renderer', innerError);
        this.name = AbstractRendererError.name;
    }
}