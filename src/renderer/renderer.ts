import { RenderingContextError } from "../errors";

export interface RendererOptions {
    view?: HTMLCanvasElement;
    width?: number;
    height?: number;
}

export class Renderer {

    public readonly view: HTMLCanvasElement;
    public readonly context: WebGLRenderingContext;

    public readonly width: number;
    public readonly height: number;

    constructor(options?: RendererOptions) {
        options = options || {};

        this.view = options.view || document.createElement('canvas');
        const context = this.view.getContext('webgl');

        if (!context) {
            throw new RenderingContextError('Could not get rendering context');
        }

        this.context = context;

        this.width = options.width || 800;
        this.height = options.height || 600;

        this.view.width = this.width;
        this.view.height = this.height;
    }
}