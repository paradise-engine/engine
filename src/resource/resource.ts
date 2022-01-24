import { BaseTexture } from "../graphics";
import { MicroEmitter } from "../util";
import { ResourceStatus } from "./resource-status";
import { ResourceType } from "./resource-type";

export interface ResourceOptions {
    name: string;
    url: string;
    type: ResourceType;
    status: ResourceStatus;
    sourceElement: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
    texture?: BaseTexture;
    permanent?: boolean;
}

interface ResourceEventTypes {
    locked: void;
    unlocked: void;
    flaggedForUnload: void;
    unflaggedFromUnload: void;
    aboutToUnload: void;
    unloaded: void;
    renamed: ResourceRenameData;
}

export type ResourceRenameData = { old: string, new: string };

export class Resource extends MicroEmitter<ResourceEventTypes> {
    private _isLocked = false;
    private _name: string;
    private _url: string;
    private _permanent = false;

    public get name() {
        return this._name;
    }

    public set name(newName: string) {
        if (newName !== this._name) {
            const old = this._name;
            this._name = newName;
            this.emit('renamed', { old, new: newName });
        }
    }

    public get url() {
        return this._url;
    }

    public readonly type: ResourceType;
    public status: ResourceStatus;

    public sourceElement: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
    public texture?: BaseTexture;

    /**
     * Determines if the resource is protected
     * from automated purge on scene transitions
     */
    public get isLocked() {
        return this._isLocked;
    }

    private onTextureDestroyed = () => {
        this.unload();
    }

    constructor(options: ResourceOptions) {
        super();
        this._name = options.name;
        this._url = options.url;
        this.type = options.type;
        this.status = options.status;
        this.sourceElement = options.sourceElement;
        this.texture = options.texture;

        if (options.permanent) {
            this._permanent = options.permanent;
        }

        if (this.texture) {
            this.texture.once('destroyed', this.onTextureDestroyed);
        }
    }

    /**
     * Locked resources are protected from automated resource purges.
     * They can still be unloaded manually, though.
     */
    public lock() {
        if (!this._isLocked) {
            this._isLocked = true;
            this.emit('locked');
        }
    }

    /**
     * Locked resources are protected from automated resource purges.
     * They can still be unloaded manually, though.
     */
    public unlock() {
        if (this._isLocked) {
            this._isLocked = false;
            this.emit('unlocked');
        }
    }

    /**
     * Destroys objects & data tied to this resource
     */
    public unload() {
        if (!this._permanent) {
            this.emit('aboutToUnload');

            this._url = '';
            this.status = ResourceStatus.Unloaded;
            this.sourceElement = undefined as any;
            this._isLocked = false;

            if (this.texture) {
                this.texture.off('destroyed', this.onTextureDestroyed);
                this.texture.destroy();
            }

            this.texture = undefined as any;

            this.emit('unloaded');
        }
    }
}