import { ISerializable, SerializableObject } from "../serialization";

export interface IRenderer<T extends SerializableObject> extends ISerializable<T> {
    clearRenderQueue(): void;
    enqueueRenderable(worldSpacePosition: [number, number], renderFn: () => void): void;
    openContainer(worldSpacePosition: [number, number]): void;
    closeContainer(): void;
    drawFrame(): void;
}