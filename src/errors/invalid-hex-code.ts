import { ParadiseError } from "./paradise-error";

export class InvalidHexCodeError extends ParadiseError {
    constructor(hexCode: string) {
        super(`Invalid HEX code '${hexCode}'`);
        this.name = InvalidHexCodeError.name;
    }
}