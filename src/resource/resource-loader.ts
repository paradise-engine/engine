import { ResourceType } from "./resource-type";
import { MimeTypeExtensions } from "./mime-types";
import { Resource } from "./resource";
import { ParadiseError, ResourceLoaderError } from "../errors";
import { ResourceStatus } from "./resource-status";
import { Renderer, BaseTexture } from "../renderer";
import { Dictionary } from "../util";

export type ResourceLoadCallback = (resource: Resource) => void;
export type ResourcesLoadCallback = (resources: Resource[]) => void;

interface ResourceLoadTask {
    name: string;
    url: string;
    callback?: ResourceLoadCallback;
}

export class ResourceLoader {

    private _batchLoadingQueue: ResourceLoadTask[] = [];
    private _resourceMap: Dictionary<Resource> = {};

    public readonly renderer: Renderer;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    public add(name: string, url: string, onload?: ResourceLoadCallback) {
        const task: ResourceLoadTask = {
            name,
            url,
            callback: onload
        };
        this._batchLoadingQueue.push(task);
    };

    public load(onload?: ResourcesLoadCallback) {
        const tasks = this._batchLoadingQueue.concat([]);
        this._batchLoadingQueue = [];

        const promises: Promise<Resource>[] = [];

        tasks.forEach(task => {
            const promise = this.loadSingle(task).then(
                (resource) => {
                    this._resourceMap[resource.name] = resource;
                    if (task.callback) {
                        task.callback(resource);
                    }
                    return resource;
                },
                (error: Error) => {
                    throw new ResourceLoaderError(`Error loading resource '${task.name}' (${task.url})`, error);
                }
            );

            promises.push(promise);
        });

        Promise.all(promises).then((resources) => {
            if (onload) {
                onload(resources);
            }
        }, (err) => {
            if (err instanceof ResourceLoaderError) {
                throw err;
            }

            throw new ResourceLoaderError('Unknown error while loading resources', err);
        });
    }

    private async loadSingle(task: ResourceLoadTask): Promise<Resource> {
        const url = new URL(task.url);
        const extension = '.' + url.pathname.split('.').pop();

        const mimeType = MimeTypeExtensions[extension];
        if (mimeType) {
            switch (mimeType.type) {
                case ResourceType.Image:
                    return await this.loadImage(task);
                case ResourceType.Audio:
                    return await this.loadAudio(task);
                case ResourceType.Video:
                    return await this.loadVideo(task);
                default:
                    throw new ParadiseError(`FATAL: Unknown MIME type '${mimeType.type}'`);
            }
        } else {
            throw new ParadiseError(`FATAL: Unknown extension '${extension}'`);
        }
    }

    private loadImage(task: ResourceLoadTask): Promise<Resource> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => {

                const texture = BaseTexture.createImageTexture(this.renderer.context, image);

                const resource = new Resource({
                    name: task.name,
                    url: task.url,
                    type: ResourceType.Image,
                    status: ResourceStatus.Loaded,
                    sourceElement: image,
                    texture: texture
                });

                return resolve(resource);

            }

            image.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
                if (error) {
                    return reject(error);
                }

                return reject(new Error('Unknown error'));
            }

            image.src = task.url;
        });
    }

    private loadVideo(task: ResourceLoadTask): Promise<Resource> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';

            video.oncanplaythrough = () => {

                const texture = BaseTexture.createVideoTexture(this.renderer.context, video);

                const resource = new Resource({
                    name: task.name,
                    url: task.url,
                    type: ResourceType.Video,
                    status: ResourceStatus.Loaded,
                    sourceElement: video,
                    texture: texture
                });

                return resolve(resource);

            }

            video.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
                if (error) {
                    return reject(error);
                }

                return reject(new Error('Unknown error'));
            }
        });
    }

    private loadAudio(task: ResourceLoadTask): Promise<Resource> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();

            audio.oncanplaythrough = () => {

                const resource = new Resource({
                    name: task.name,
                    url: task.url,
                    type: ResourceType.Audio,
                    status: ResourceStatus.Loaded,
                    sourceElement: audio
                });

                return resolve(resource);

            }

            audio.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
                if (error) {
                    return reject(error);
                }

                return reject(new Error('Unknown error'));
            }
        });
    }

}