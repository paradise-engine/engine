import type { GlobalShaderData } from "./global-shader-data";
import type { IRenderContext } from "./i-render-context";
import { MaskLayer } from "./mask-layer";
import { RenderLayer } from "./render-layer";
import type { Shader } from "./shader";
import type { ShaderPipeline } from "./shader-pipeline";

export interface IRenderPipelineView {
    width: number;
    height: number;
    clientWidth: number;
    clientHeight: number;

    getContext(contextId: "webgl", options?: WebGLContextAttributes): WebGLRenderingContext | null;
    getBoundingClientRect(): DOMRect;

    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}

export interface RenderPipelineEnqueueOptions {
    worldSpacePosition: [number, number]
    layer?: number;
}

export interface IRenderPipeline {
    context: IRenderContext;
    view: IRenderPipelineView;
    globalShaderData: GlobalShaderData;
    shaderPipeline: ShaderPipeline;
    baseShader: Shader;
    maskLayer: MaskLayer;
    layers: RenderLayer[];
    defaultLayer: number;

    clearRenderQueue(): void;
    enqueueRenderable(options: RenderPipelineEnqueueOptions, renderFn: () => void): void;
    drawFrame(): void;
    addLayer(layer: RenderLayer): void;
    setDefaultLayer(layerNumber: number): void;

    resizeView(width: number, height: number): void;
}