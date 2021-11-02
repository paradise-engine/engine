export interface SerializableObject {
    _ctor: string;
}

export interface ISerializable<T extends SerializableObject> {
    getSerializableObject: () => T;
}