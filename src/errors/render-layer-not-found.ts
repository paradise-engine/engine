import { ParadiseError } from "./paradise-error";

export class RenderLayerNotFoundError extends ParadiseError {
    constructor(layerIndex: number, innerError?: Error) {
        super(
            `Render layer '${layerIndex}' not found in current pipeline.`,
            innerError
        );
        this.name = RenderLayerNotFoundError.name;
    }
}