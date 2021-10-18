import { BaseTexture } from "../renderer";
import { ResourceStatus } from "./resource-status";
import { ResourceType } from "./resource-type";

export interface ResourceOptions {
    name: string;
    url: string;
    type: ResourceType;
    status: ResourceStatus;
    sourceElement: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
    texture?: BaseTexture;
}

export class Resource {
    public name: string;
    public url: string;
    public type: ResourceType;
    public status: ResourceStatus;

    public sourceElement: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
    public texture?: BaseTexture;

    constructor(options: ResourceOptions) {
        this.name = options.name;
        this.url = options.url;
        this.type = options.type;
        this.status = options.status;
        this.sourceElement = options.sourceElement;
        this.texture = options.texture;
    }
}