import 'reflect-metadata';

const MKEY_IS_CONTROL_TYPE = 'paradise:is_control_type';

/**
 * Decorator to apply to classes that can be exposed as
 * single controls on objects and components.
 */
export function ControlType() {
    return function ControlTypeDecorator(constructor: Function) {
        Reflect.defineMetadata(MKEY_IS_CONTROL_TYPE, true, constructor);
    }
}

export function isControlType(ctor: Function) {
    const val = Reflect.getMetadata(MKEY_IS_CONTROL_TYPE, ctor);
    if (val === true) {
        return true;
    }

    return false;
}