import { ParadiseError } from "./paradise-error";

export class UnknownDeserializableError extends ParadiseError {
    constructor(cname: string, innerError?: Error) {
        super(
            `Unknown deserializable class '${cname}'. `,
            innerError
        );

        this.name = UnknownDeserializableError.name;
    }
}