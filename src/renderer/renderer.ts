import { resetViewport, Shader } from "./webgl";
import { RendererRanOutOfContainersError, RenderingContextError } from "../errors";
import { DefaultShader } from './shader';
import { ShaderPipeline } from "./shader-pipeline";
import { GlobalShaderData } from "./global-shader-data";
import { IRenderer } from "./i-renderer";

export interface RendererOptions {
    view?: HTMLCanvasElement;
    width?: number;
    height?: number;
    baseShader?: Shader;
    antialias?: boolean;
}

interface RenderQueueItem {
    worldSpacePosition: [number, number];
    items?: RenderQueueItem[],
    renderFn?: () => void;
}

type RenderQueue = RenderQueueItem[];

function sortQueueItems(queue: RenderQueue) {
    for (const item of queue) {
        if (item.items) {
            sortQueueItems(item.items);
        }
    }

    return queue.sort((a, b) => {
        const a_y = a.worldSpacePosition[1];
        const b_y = b.worldSpacePosition[1];
        if (a_y === b_y) {
            return 0;
        }
        if (a_y < b_y) {
            return -1;
        }
        return 1;
    });
}

function drawQueueItem(item: RenderQueueItem) {
    if (item.items) {
        for (const child of item.items) {
            drawQueueItem(child);
        }
    }

    if (item.renderFn) {
        item.renderFn();
    }
}

export class Renderer implements IRenderer {

    private _renderQueue: RenderQueue = [];
    private _activeQueueStack: RenderQueue[] = [];

    public readonly view: HTMLCanvasElement;
    public readonly context: WebGLRenderingContext;

    public readonly width: number;
    public readonly height: number;

    public readonly globalShaderData: GlobalShaderData;
    public readonly baseShader: Shader;
    public readonly shaderPipeline: ShaderPipeline;

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

        resetViewport(context);

        this.globalShaderData = new GlobalShaderData(this);
        this.baseShader = options.baseShader || new DefaultShader(this);
        this.shaderPipeline = new ShaderPipeline(this);

        this.globalShaderData.setUniform('u_resolution', [this.view.width, this.view.height]);

        this._activeQueueStack.push(this._renderQueue);
    }

    public clearRenderQueue() {
        this._renderQueue = [];
        this._activeQueueStack = [];
        this._activeQueueStack.push(this._renderQueue);
    }

    public enqueueRenderable(worldSpacePosition: [number, number], renderFn: () => void) {
        const activeQueue = this._activeQueueStack[this._activeQueueStack.length - 1];
        activeQueue.push({ worldSpacePosition, renderFn });
    }

    public openContainer(worldSpacePosition: [number, number]) {
        const container: RenderQueue = [];
        const activeQueue = this._activeQueueStack[this._activeQueueStack.length - 1];
        activeQueue.push({ worldSpacePosition, items: container });

        this._activeQueueStack.push(container);
    }

    public closeContainer() {
        if (this._activeQueueStack.length === 1) {
            throw new RendererRanOutOfContainersError();
        }
        this._activeQueueStack.pop();
    }

    /**
     * Draws every enqueued item
     */
    public drawFrame() {
        sortQueueItems(this._renderQueue);
        for (const item of this._renderQueue) {
            drawQueueItem(item);
        }
        this.clearRenderQueue();
    }
}