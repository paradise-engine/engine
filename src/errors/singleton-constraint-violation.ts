import { ParadiseError } from "./paradise-error";

export class SingletonConstraintViolationError extends ParadiseError {
    constructor(singletonName: string) {
        super(
            `Cannot instantiate class '${singletonName}': Singleton classes may only have a signle instance`
        );

        this.name = SingletonConstraintViolationError.name;
    }
}