import { ResourceType } from "./resource-type";
import { MimeTypeExtensions, MimeType, MimeTypes } from "./mime-types";
import { Resource, ResourceRenameData } from "./resource";
import { ParadiseError, ResourceLoaderError } from "../errors";
import { ResourceStatus } from "./resource-status";
import { WebGLRenderPipeline, BaseTexture, BaseTextureType } from "../graphics";
import { browserApisAvailable, Dictionary, MicroListener } from "../util";
import { IResourceLoader, ResourceLoadCallback, ResourcesLoadCallback } from "./i-resource-loader";
import { FileEncoding, fileSystem } from "../runtime";

const EMPTY_IMAGE_KEY = 'paradise::reserved::loader_empty_image';
const EDITOR_MOVE_HANDLE_HORIZONTAL_KEY = 'paradise::reserved::editor_handle_horizontal';
const EDITOR_MOVE_HANDLE_VERTICAL_KEY = 'paradise::reserved::editor_handle_vertical';
const EDITOR_MOVE_HANDLE_BOTH_KEY = 'paradise::reserved::editor_handle_both';

interface ResourceLoadTask {
    name: string;
    url: string;
    callback?: ResourceLoadCallback;
}

interface ResourceLoadOptions {
    cors?: boolean;
    localFile?: boolean;
    mimeType: MimeType;
}

let emptyImg: HTMLImageElement | null = null;
if (browserApisAvailable()) {
    emptyImg = new Image(1, 1);
    emptyImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
}

let editor_moveHandleHorizontalImg: HTMLImageElement | null = null;
if (browserApisAvailable()) {
    editor_moveHandleHorizontalImg = new Image(100, 13);
    editor_moveHandleHorizontalImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAANCAYAAABfGcvGAAAACXBIWXMAAACNAAAAjQHGZvekAAABoklEQVRYhe2WQUsCQRTH38wb3VmpNI2KSs8hRNCtS4eOQR/GS9+gc9egD1DX9lAEJUKU0qFbRBAVtuawatFmyrq1EwpCRFm6Bor7gznt8Gffe/x4Q6SU4NEZK5MT2xHnPYcAx0nOD7NZ/dVtK72BuGAjFNQSzyakFQX2AqpdQCoA4PYBcV8TxkUnyaxXiutnFi2rfnwAENUZRtOKsrQWCZt5pKJdezxDXNA0pBV1e7SAWn1CWqwScvVE6VEre0g0Oj3X85X3KAnzZf23gXxGZ9gY0KmilPIMBZcy89UesjU8pMVr9sA1sxvEbRtGHKfjpMw39jBSs4FYVi/V2TdcuvzRet+nKFENzsfKiHZNSotthoLJAephV5mtVJYXXsptRZoM4VpVQfj9ooK0ZBOSOhPGQfO7t9RdsBoKavN/2CH3Kocc59UqYt4hcJPjfCeb1Y3v7nrP3n+gzBDuVRUefb7SK0PxRkjq/JMFrfAG0iWaFlhIi2+EXFEJ2kmheNduujcQFwjFD+XwaMMClDKTNoq7bjO9HeKCWGxm/Kdd0BEA8AGyTruUuAGTTAAAAABJRU5ErkJggg==';
}

let editor_moveHandleVerticalImg: HTMLImageElement | null = null;
if (browserApisAvailable()) {
    editor_moveHandleVerticalImg = new Image(13, 100);
    editor_moveHandleVerticalImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAABkCAYAAABdELruAAAACXBIWXMAAACNAAAAjQHGZvekAAABl0lEQVRYhe3YsU7CQBjA8a+lWCqgUUpbAlQ0MUTRQScWDEYNYZHV0YTB1Wdyc+VNfAInZweNd4XenWm11Lu22NHE+5ImDe2vXP9AB4Axltjsk3rPGph3aceCTYOUoTq9YAbspR0LJhUxjXVJlZpZSBVfcN1WmejUxPvYcMbWKBfCTXz50UEGOsTASmyYCylE6XuOF+6TbVrLhfwycaL9eW/uuG7LWomcU6vnOd7y6ugMAT7HNytRkNqzvfhdGwSYlkzPoSC1XyHcCcQijUwUpRZPwENsOBM+/RJFqUWERhiYwaePl8dgEKUWx2/ERTlE1qmTKgBgcbSo1admh0NhatvbyEJohEDx4ZpDpEzGP1MnltciwX11xeXtiqnFIVtxWTVMXcq+n2iC9NatOQlRmHoHFX9DQXoFK/2v5a1Inbi37/SaigvNzSc+3NvBO1CgUH2sgKrEH6X2UqiF33rxodFuN4/1qT6DB5jZV9Z92oMl8XvKMxJJJJFEEkkk0b9HEkkkkUQSSSTRH0epfwquvRYBnjMEAHwCeYy/m1q5elcAAAAASUVORK5CYII=';
}

let editor_moveHandleBothImg: HTMLImageElement | null = null;
if (browserApisAvailable()) {
    editor_moveHandleBothImg = new Image(30, 30);
    editor_moveHandleBothImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAC8AAAAvAHPHSQeAAAAa0lEQVRIie3XMQqAMBBE0VG2t9Ai4B28imfVg3gLIYUW6QPKJGBlJ6zNfNj6tTsNpmvFD1khuxzR592FP21EslBhovOxucDLAMKtC/aSYMGCBQsWLFiwYMGCv1eXBGcFP3yPaD1wslDOKwA3pPUS6UPMTu4AAAAASUVORK5CYII=';
}

export class ResourceLoader implements IResourceLoader {
    private _batchLoadingQueue: ResourceLoadTask[] = [];
    private _resourceMap: Dictionary<Resource> = {};
    private _flaggedForPurge: Resource[] = [];
    private _renderPipeline: WebGLRenderPipeline;
    private _readyPromise: Promise<any>;

    public get renderPipeline() {
        return this._renderPipeline;
    }

    public get EMPTY_IMAGE() {
        return this._resourceMap[EMPTY_IMAGE_KEY];
    }

    public get EDITOR_MOVE_HANDLE_HORIZONTAL() {
        return this._resourceMap[EDITOR_MOVE_HANDLE_HORIZONTAL_KEY];
    }

    public get EDITOR_MOVE_HANDLE_VERTICAL() {
        return this._resourceMap[EDITOR_MOVE_HANDLE_VERTICAL_KEY];
    }

    public get EDITOR_MOVE_HANDLE_BOTH() {
        return this._resourceMap[EDITOR_MOVE_HANDLE_BOTH_KEY];
    }

    constructor(renderPipeline: WebGLRenderPipeline) {
        this._renderPipeline = renderPipeline;
        this._readyPromise = Promise.all(this._createReservedResources());
    }

    public ready(cb: () => void) {
        this._readyPromise.then(cb);
    }

    private _createReservedResources() {
        return [
            this._createReserved(emptyImg, EMPTY_IMAGE_KEY),
            this._createReserved(editor_moveHandleHorizontalImg, EDITOR_MOVE_HANDLE_HORIZONTAL_KEY),
            this._createReserved(editor_moveHandleVerticalImg, EDITOR_MOVE_HANDLE_VERTICAL_KEY),
            this._createReserved(editor_moveHandleBothImg, EDITOR_MOVE_HANDLE_BOTH_KEY)
        ];
    }

    private _createReserved(img: HTMLImageElement | null, key: string) {
        return new Promise<void>(resolve => {
            if (img) {
                const createResource = () => {
                    const baseTexture = BaseTexture.createImageTexture(this._renderPipeline.context, img);

                    const res = new Resource({
                        name: key,
                        url: key,
                        type: ResourceType.Image,
                        status: ResourceStatus.Loaded,
                        sourceElement: baseTexture.srcElement,
                        texture: baseTexture,
                        permanent: true
                    });

                    this._resourceMap[key] = res;

                    resolve();
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
                    name: key,
                    url: key,
                    type: ResourceType.Image,
                    status: ResourceStatus.Loaded,
                    sourceElement: baseTexture.srcElement,
                    texture: baseTexture,
                    permanent: true
                });

                this._resourceMap[key] = res;
                resolve();
            }
        });
    }

    public setRenderPipeline(pipeline: WebGLRenderPipeline) {
        this._renderPipeline = pipeline;
        for (const resource of Object.values(this._resourceMap)) {
            if (resource.texture) {
                resource.texture.setContext(pipeline.context);
            }
        }

        this._createReservedResources();
    }

    public add(url: string, name?: string, onload?: ResourceLoadCallback) {
        name = name || url;

        if (name.startsWith('paradise::reserved::')) {
            const res = this._resourceMap[name];
            if (res) {
                if (onload) {
                    onload(res);
                }
                return;
            }
        }

        const flaggedRes = this._flaggedForPurge.find(r => r.name === name);

        if (flaggedRes) {
            this.unflagFromUnload(flaggedRes);
        } else {
            const task: ResourceLoadTask = {
                name: name,
                url,
                callback: onload
            };
            this._batchLoadingQueue.push(task);
        }
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
        let cors = false;
        let localFile = false;

        const currentUrl = new URL(location.href);
        const url = new URL(task.url, window.location.origin);

        if (url.protocol !== 'file:' && url.origin !== currentUrl.origin) {
            cors = true;
        }

        if (url.protocol === 'file:') {
            localFile = true;
            let filePath = url.pathname;
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1);
            }
            task.url = filePath;
        }

        let mimeType: MimeType | null = null;
        if (url.protocol === 'data:') {
            mimeType = MimeTypes[url.pathname.split(';')[0]]
        } else {
            const extension = '.' + url.pathname.split('.').pop();
            mimeType = MimeTypeExtensions[extension];

            if (!mimeType) {
                throw new ParadiseError(`FATAL: Unknown extension '${extension}'`);
            }
        }

        if (mimeType) {
            switch (mimeType.type) {
                case ResourceType.Image:
                    return await this.loadImage(task, { cors, localFile, mimeType });
                case ResourceType.Audio:
                    return await this.loadAudio(task, { cors, localFile, mimeType });
                case ResourceType.Video:
                    return await this.loadVideo(task, { cors, localFile, mimeType });
                default:
                    throw new ParadiseError(`FATAL: Unknown MIME type '${mimeType.type}'`);
            }
        } else {
            throw new ParadiseError(`FATAL: Could not detect MIME type for url '${task.url}'`);
        }
    }

    private loadImage(task: ResourceLoadTask, options: ResourceLoadOptions): Promise<Resource> {
        return new Promise(async (resolve, reject) => {

            let url = task.url;
            if (options.localFile) {
                url = `data:${options.mimeType.name};base64,${await fileSystem.readFile(task.url, { encoding: FileEncoding.BASE64 })}`;
            }

            const image = new Image();

            if (options.cors) {
                image.crossOrigin = 'anonymous';
            }

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

            image.src = url;
        });
    }

    private loadVideo(task: ResourceLoadTask, options: ResourceLoadOptions): Promise<Resource> {
        return new Promise(async (resolve, reject) => {

            let url = task.url;
            if (options.localFile) {
                url = `data:${options.mimeType.name};base64,${await fileSystem.readFile(task.url, { encoding: FileEncoding.BASE64 })}`;
            }

            const video = document.createElement('video');

            if (options.cors) {
                video.crossOrigin = 'anonymous';
            }

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

            video.src = url;
        });
    }

    private loadAudio(task: ResourceLoadTask, options: ResourceLoadOptions): Promise<Resource> {
        return new Promise(async (resolve, reject) => {

            let url = task.url;
            if (options.localFile) {
                url = `data:${options.mimeType.name};base64,${await fileSystem.readFile(task.url, { encoding: FileEncoding.BASE64 })}`;
            }

            const audio = new Audio();

            if (options.cors) {
                audio.crossOrigin = 'anonymous';
            }

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

            audio.src = url;
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
            if (resKey !== EMPTY_IMAGE_KEY && this._resourceMap.hasOwnProperty(resKey)) {
                const resource = this._resourceMap[resKey];
                if (!resource.isLocked && !this.isFlaggedForPurge(resource)) {
                    this._flaggedForPurge.push(resource);
                    resource.status = ResourceStatus.FlaggedForUnload;
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
}
