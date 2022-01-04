import { ISerializable, SerializableObject } from "../serialization";

export interface IRendererView {
    width: number;
    height: number;
    clientWidth: number;
    clientHeight: number;

    getContext(contextId: "webgl", options?: WebGLContextAttributes): WebGLRenderingContext | null;
    getBoundingClientRect(): DOMRect;

    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}

export interface IRenderer<T extends SerializableObject> extends ISerializable<T> {
    clearRenderQueue(): void;
    enqueueRenderable(worldSpacePosition: [number, number], renderFn: () => void): void;
    openContainer(worldSpacePosition: [number, number]): void;
    closeContainer(): void;
    drawFrame(): void;
    view: IRendererView;
}