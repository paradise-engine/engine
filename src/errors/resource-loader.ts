import { ParadiseError } from "./paradise-error";

export class ResourceLoaderError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = ResourceLoaderError.name;
    }
}