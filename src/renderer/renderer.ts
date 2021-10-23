import { Shader } from "../webgl";
import { RenderingContextError } from "../errors";
import { BaseShader } from '../shader';

export interface RendererOptions {
    view?: HTMLCanvasElement;
    width?: number;
    height?: number;
    baseShader?: Shader;
    antialias?: boolean;
}

export class Renderer {

    public readonly view: HTMLCanvasElement;
    public readonly context: WebGLRenderingContext;

    public readonly width: number;
    public readonly height: number;

    public readonly baseShader: Shader;

    constructor(options?: RendererOptions) {
        options = options || {};

        this.view = options.view || document.createElement('canvas');
        const context = this.view.getContext('webgl', {
            antialias: options.antialias || false
        });

        if (!context) {
            throw new RenderingContextError('Could not get rendering context');
        }

        this.context = context;

        this.width = options.width || 800;
        this.height = options.height || 600;

        this.view.width = this.width;
        this.view.height = this.height;

        this.baseShader = options.baseShader || new BaseShader(this);
    }
}