import { ParadiseError } from "./paradise-error";

export class MaskLayerOutOfBoundsError extends ParadiseError {
    constructor(message?: string, innerError?: Error) {
        super(message || 'Cannot add more objects to MaskLayer: max. number of objects per frame reached', innerError);
        this.name = MaskLayerOutOfBoundsError.name;
    }
}