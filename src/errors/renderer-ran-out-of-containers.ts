import { ParadiseError } from "./paradise-error";

export class RendererRanOutOfContainersError extends ParadiseError {
    constructor(message?: string, innerError?: Error) {
        super(
            message || 'Renderer has run out of containers to close. You have probably called `closeContainer()` one too many times.',
            innerError
        );
        this.name = RendererRanOutOfContainersError.name;
    }
}