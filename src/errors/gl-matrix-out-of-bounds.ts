import { ParadiseError } from "./paradise-error";

export class GLMatrixOutOfBoundsError extends ParadiseError {
    constructor(message: string) {
        super(message);
    }
}