import { ParadiseError } from "./paradise-error";

export class SceneLoadError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = SceneLoadError.name;
    }
}