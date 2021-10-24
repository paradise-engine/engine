import { ParadiseError } from "./paradise-error";

export class InactiveShaderError extends ParadiseError {
    constructor(message?: string) {
        super(message || 'Cannot render using inactive shader');
        this.name = InactiveShaderError.name;
    }
}