import { ParadiseError } from "./paradise-error";

export class RenderingContextError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = RenderingContextError.name;
    }
}