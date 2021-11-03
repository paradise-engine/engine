import { ParadiseError } from "./paradise-error";

export class ColorComponentOutOfBoundsError extends ParadiseError {
    constructor(min: number, max: number, actual: number) {
        super(`Color component out of bounds: Expected ${min}-${max}, got ${actual}`);
        this.name = ColorComponentOutOfBoundsError.name;
    }
}