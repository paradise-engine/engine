import { ResourceType } from "./resource-type";
import { MimeTypeExtensions } from "./mime-types";
import { Resource, ResourceRenameData } from "./resource";
import { BrowserApiError, ParadiseError, ResourceLoaderError } from "../errors";
import { ResourceStatus } from "./resource-status";
import { WebGLRenderPipeline, BaseTexture, SerializableRenderPipeline, BaseTextureType } from "../graphics";
import { browserApisAvailable, Dictionary, MicroListener } from "../util";
import { IResourceLoader, ResourceLoadCallback, ResourcesLoadCallback } from "./i-resource-loader";
import { DeserializationOptions, deserialize, registerDeserializable, SerializableObject } from "../serialization";

const EMPTY_IMAGE_KEY = 'paradise::reserved::loader_empty_image';

interface ResourceLoadTask {
    name: string;
    url: string;
    callback?: ResourceLoadCallback;
}

export interface SerializableResourceLoader extends SerializableObject {
    renderPipeline: SerializableRenderPipeline;
}

let emptyImg: HTMLImageElement | null = null;
if (browserApisAvailable()) {
    emptyImg = new Image(1, 1);
    emptyImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
}

export class ResourceLoader implements IResourceLoader<SerializableResourceLoader> {

    public static fromSerializable(s: SerializableResourceLoader, options: DeserializationOptions) {
        return new ResourceLoader(deserialize(s.renderPipeline, options));
    }

    private _batchLoadingQueue: ResourceLoadTask[] = [];
    private _resourceMap: Dictionary<Resource> = {};
    private _flaggedForPurge: Resource[] = [];
    private _renderPipeline: WebGLRenderPipeline;

    public get renderPipeline() {
        return this._renderPipeline;
    }

    public get EMPTY_IMAGE() {
        return this._resourceMap[EMPTY_IMAGE_KEY];
    }

    constructor(renderPipeline: WebGLRenderPipeline) {
        this._renderPipeline = renderPipeline;
        this._createEmptyImage();
    }

    private _createEmptyImage() {
        if (emptyImg) {
            const img = emptyImg;

            const createResource = () => {
                const baseTexture = BaseTexture.createImageTexture(this._renderPipeline.context, img);

                const res = new Resource({
                    name: EMPTY_IMAGE_KEY,
                    url: EMPTY_IMAGE_KEY,
                    type: ResourceType.Image,
                    status: ResourceStatus.Loaded,
                    sourceElement: baseTexture.srcElement,
                    texture: baseTexture
                });

                this._resourceMap[EMPTY_IMAGE_KEY] = res;
            }

            if (img.complete) {
                createResource();
            } else {
                img.onload = createResource;
            }
        } else {

            const baseTexture = new BaseTexture(
                this._renderPipeline.context,
                { texture: {} },
                BaseTextureType.Image,
                {} as any
            );

            const res = new Resource({
                name: EMPTY_IMAGE_KEY,
                url: EMPTY_IMAGE_KEY,
                type: ResourceType.Image,
                status: ResourceStatus.Loaded,
                sourceElement: baseTexture.srcElement,
                texture: baseTexture
            });

            this._resourceMap[EMPTY_IMAGE_KEY] = res;

        }


    }

    public setRenderPipeline(pipeline: WebGLRenderPipeline) {
        this._renderPipeline = pipeline;
        for (const resource of Object.values(this._resourceMap)) {
            if (resource.texture) {
                resource.texture.setContext(pipeline.context);
            }
        }

        this._createEmptyImage();
    }

    public add(url: string, name?: string, onload?: ResourceLoadCallback) {
        const task: ResourceLoadTask = {
            name: name || url,
            url,
            callback: onload
        };
        this._batchLoadingQueue.push(task);
    };

    public getResource(name: string): Resource | undefined {
        return this._resourceMap[name];
    }

    public load(onload?: ResourcesLoadCallback) {
        const tasks = this._batchLoadingQueue.concat([]);
        this._batchLoadingQueue = [];

        const promises: Promise<Resource>[] = [];

        tasks.forEach(task => {
            const promise = this.loadSingle(task).then(
                (resource) => {
                    this._resourceMap[resource.name] = resource;
                    const self = this;

                    let bypassRenameListener = false;

                    const onRenamed: MicroListener<Resource, ResourceRenameData> = function (data) {
                        if (!bypassRenameListener) {
                            bypassRenameListener = true;

                            if (self._resourceMap[data.new]) {
                                this.name = data.old;
                                throw new ResourceLoaderError(`Cannot rename resource to '${data.new}': Another resource with this name already exists`);
                            }

                            self._resourceMap[data.new] = resource;
                            delete self._resourceMap[data.old];

                            bypassRenameListener = false;
                        }
                    }

                    const onUnloaded: MicroListener<Resource> = function () {
                        delete self._resourceMap[this.name];
                        this.off('renamed', onRenamed);
                    }

                    resource.on('renamed', onRenamed);
                    resource.once('unloaded', onUnloaded);

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
        const url = new URL(task.url, window.location.origin);
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

                const texture = BaseTexture.createImageTexture(this.renderPipeline.context, image);

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

                const texture = BaseTexture.createVideoTexture(this.renderPipeline.context, video);

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

    public isFlaggedForPurge(resource: Resource) {
        return this._flaggedForPurge.indexOf(resource) !== -1;
    }

    /**
     * Flag all resources that are not locked
     * for unloading.
     * Call `purge()` to unload flagged resources.
     */
    public preparePurge() {
        for (const resKey of Object.keys(this._resourceMap)) {
            if (this._resourceMap.hasOwnProperty(resKey)) {
                const resource = this._resourceMap[resKey];
                if (!resource.isLocked && !this.isFlaggedForPurge(resource)) {
                    this._flaggedForPurge.push(resource);
                }
            }
        }
    }

    /**
     * Manually flags a resource for unloading during purge.
     * Resource gets flagged even if it is locked.
     * Call `purge()` to unload flagged resources.
     * @param resource 
     */
    public flagForUnload(resource: Resource) {
        const cachedResource = this._resourceMap[resource.name];

        if (!cachedResource || cachedResource !== resource) {
            throw new ResourceLoaderError('Cannot flag resource for unload: Resource not known to resource loader');
        }

        if (!this.isFlaggedForPurge(resource)) {
            this._flaggedForPurge.push(resource);
            resource.status = ResourceStatus.FlaggedForUnload;
            resource.emit('flaggedForUnload');
        }
    }

    /**
     * Un-flags a resource that was previously flagged for unload
     * during purge.
     * @param resource 
     */
    public unflagFromUnload(resource: Resource) {
        const cachedResource = this._resourceMap[resource.name];

        if (!cachedResource || cachedResource !== resource) {
            throw new ResourceLoaderError('Cannot unflag resource from unload: Resource not known to resource loader');
        }

        if (this.isFlaggedForPurge(resource)) {
            this._flaggedForPurge.splice(this._flaggedForPurge.indexOf(resource), 1);
            resource.status = ResourceStatus.Loaded;
            resource.emit('unflaggedFromUnload');
        }
    }

    /**
     * Unloads all resources that are flagged for unload.
     */
    public purge() {
        for (const resource of this._flaggedForPurge.slice()) {
            this.unloadResource(resource);
        }
        this._flaggedForPurge = [];
    }

    /**
     * Immediately unloads a resource.
     * @param resource 
     */
    public unloadResource(resource: Resource) {
        resource.unload();
    }

    public getSerializableObject(): SerializableResourceLoader {
        return {
            _ctor: ResourceLoader.name,
            renderPipeline: this.renderPipeline.getSerializableObject()
        }
    }

}
registerDeserializable(ResourceLoader);