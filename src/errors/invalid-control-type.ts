import { ParadiseError } from "./paradise-error";

export class InvalidControlTypeError extends ParadiseError {
    constructor(typeName: string, innerError?: Error) {
        super(
            `Invalid control type '${typeName}'`,
            innerError
        );

        this.name = InvalidControlTypeError.name;
    }
}