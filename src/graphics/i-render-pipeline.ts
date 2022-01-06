import type { ISerializable, SerializableObject } from "../serialization";
import type { GlobalShaderData } from "./global-shader-data";
import type { IRenderContext } from "./i-render-context";
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

export interface IRenderPipeline<T extends SerializableObject = any> extends ISerializable<T> {
    context: IRenderContext;
    view: IRenderPipelineView;
    globalShaderData: GlobalShaderData;
    shaderPipeline: ShaderPipeline;
    baseShader: Shader;

    clearRenderQueue(): void;
    enqueueRenderable(worldSpacePosition: [number, number], renderFn: () => void): void;
    openContainer(worldSpacePosition: [number, number]): void;
    closeContainer(): void;
    drawFrame(): void;
}