import { Texture } from "./texture";
import { ResourceStatus } from "./resource-status";
import { ResourceType } from "./resource-type";

export interface ResourceOptions {
    name: string;
    url: string;
    type: ResourceType;
    status: ResourceStatus;
    sourceElement: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
    texture?: Texture;
}

export class Resource {
    public name: string;
    public url: string;
    public type: ResourceType;
    public status: ResourceStatus;

    public sourceElement: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
    public texture?: Texture;

    constructor(options: ResourceOptions) {
        this.name = options.name;
        this.url = options.url;
        this.type = options.type;
        this.status = options.status;
        this.sourceElement = options.sourceElement;
        this.texture = options.texture;
    }
}