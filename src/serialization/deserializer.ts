import { ISerializable, SerializableObject } from "./i-serializable";
import { UnknownDeserializableError } from "../errors";
import { Dictionary } from "../util";
import { Application } from "../application";

export interface DeserializableClass<T extends SerializableObject> extends Function {
    fromSerializable(s: T, options: DeserializationOptions): ISerializable<T>;
}

export interface DeserializableComponentClass<T extends SerializableObject, K> extends Function {
    applySerializable(s: T, comp: K): void;
    new(...args: any[]): K
}

export interface DeserializationOptions {
    application: Application;
}

const _serializables: Dictionary<DeserializableClass<any>> = {};
const _serializableComponents: Dictionary<DeserializableComponentClass<any, any>> = {};

export function registerDeserializable<T extends SerializableObject>(deserializableClass: DeserializableClass<T>) {
    _serializables[deserializableClass.name] = deserializableClass;
}

export function registerDeserializableComponent<T extends SerializableObject, K>(deserializableClass: DeserializableComponentClass<T, K>) {
    _serializableComponents[deserializableClass.name] = deserializableClass;
}

export function deserialize<T extends SerializableObject, K extends ISerializable<T>>(s: T, options: DeserializationOptions): K {
    const deserializableClass = _serializables[s._ctor];

    if (!deserializableClass) {
        throw new UnknownDeserializableError(s._ctor);
    }

    return deserializableClass.fromSerializable(s, options) as K;
}

export function getSerializableComponentClass(cname: string) {
    const deserializableComponentClass = _serializableComponents[cname];

    if (!deserializableComponentClass) {
        throw new UnknownDeserializableError(cname);
    }

    return deserializableComponentClass;
}

export function applySerializable<T extends SerializableObject, K extends ISerializable<T>>(s: T, comp: K) {
    const deserializableComponentClass = _serializableComponents[s._ctor];

    if (!deserializableComponentClass) {
        throw new UnknownDeserializableError(s._ctor);
    }

    deserializableComponentClass.applySerializable(s, comp);
}