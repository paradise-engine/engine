import { IRenderPipeline } from "../graphics";
import { Resource } from "./resource";

export type ResourceLoadCallback = (resource: Resource) => void;
export type ResourcesLoadCallback = (resources: Resource[]) => void;

export interface IResourceLoader {
    renderPipeline: IRenderPipeline;
    isFlaggedForPurge(resource: Resource): void;
    preparePurge(): void;
    flagForUnload(resource: Resource): void;
    unflagFromUnload(resource: Resource): void;
    purge(): void;
    unloadResource(resource: Resource): void;
    setRenderPipeline(renderPipeline: IRenderPipeline): void;
    add(url: string, name?: string, onload?: ResourceLoadCallback): void;
    load(onload?: ResourcesLoadCallback): void;
    getResource(name: string): Resource | undefined;
    ready(cb: () => void): void;

    EMPTY_IMAGE: Resource;
    EDITOR_MOVE_HANDLE_HORIZONTAL: Resource;
    EDITOR_MOVE_HANDLE_VERTICAL: Resource;
    EDITOR_MOVE_HANDLE_BOTH: Resource;
}
