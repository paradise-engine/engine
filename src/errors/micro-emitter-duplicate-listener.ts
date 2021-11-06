import { ParadiseError } from "./paradise-error";

export class MicroEmitterDuplicateListenerError extends ParadiseError {
    constructor(failedListenerType: 'on' | 'once') {
        const originalListenerType = failedListenerType === 'on' ? 'once' : 'on';

        super(`Cannot add event listener using '${failedListenerType}': The same listener was already added using ${originalListenerType}`);
        this.name = MicroEmitterDuplicateListenerError.name;
    }
}