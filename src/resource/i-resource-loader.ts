import { IRenderPipeline } from "../graphics";
import { ISerializable, SerializableObject } from "../serialization";
import { Resource } from "./resource";

export type ResourceLoadCallback = (resource: Resource) => void;
export type ResourcesLoadCallback = (resources: Resource[]) => void;

export interface IResourceLoader<T extends SerializableObject> extends ISerializable<T> {
    renderPipeline: IRenderPipeline<any>;
    isFlaggedForPurge(resource: Resource): void;
    preparePurge(): void;
    flagForUnload(resource: Resource): void;
    unflagFromUnload(resource: Resource): void;
    purge(): void;
    unloadResource(resource: Resource): void;
    setRenderPipeline(renderPipeline: IRenderPipeline<any>): void;
    add(url: string, name?: string, onload?: ResourceLoadCallback): void;
    load(onload?: ResourcesLoadCallback): void;
}
