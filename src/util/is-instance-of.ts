export function isInstanceOf(obj: any, ctor: Function, strict?: boolean) {
    if (strict) {
        return obj.constructor === ctor;
    } else {
        return obj instanceof ctor;
    }
}