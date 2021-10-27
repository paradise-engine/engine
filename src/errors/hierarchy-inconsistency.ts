import { ParadiseError } from "./paradise-error";

export class HierarchyInconsistencyError extends ParadiseError {
    constructor(message: string, innerError?: Error) {
        super(message, innerError);
        this.name = HierarchyInconsistencyError.name;
    }
}