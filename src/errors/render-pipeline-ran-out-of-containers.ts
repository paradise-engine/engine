import { ParadiseError } from "./paradise-error";

export class RenderPipelineRanOutOfContainersError extends ParadiseError {
    constructor(message?: string, innerError?: Error) {
        super(
            message || 'Render Pipeline has run out of containers to close. You probably have called `closeContainer()` one too many times.',
            innerError
        );
        this.name = RenderPipelineRanOutOfContainersError.name;
    }
}