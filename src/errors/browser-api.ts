import { ParadiseError } from "./paradise-error";

export class BrowserApiError extends ParadiseError {
    constructor(message?: string, innerError?: Error) {
        super(message || 'Current environment does not support browser APIs.', innerError);
        this.name = BrowserApiError.name;
    }
}