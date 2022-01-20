import { resetViewport, tagContext } from "../webgl";
import { RenderPipelineRanOutOfContainersError, RenderingContextError } from "../../errors";
import { DefaultShader, Shader } from '../shader';
import { ShaderPipeline } from "../shader-pipeline";
import { GlobalShaderData } from "../global-shader-data";
import { WebGLPipelineRenderContext } from "./webgl-render-context";
import { WebGLDebugUtils } from './webgl_debug';
import { MaskLayer } from "../mask-layer";
import { Color } from "../../data-structures";
import { IRenderPipeline } from "../i-render-pipeline";

export interface WebGLRenderPipelineOptions {
    view?: HTMLCanvasElement;
    width?: number;
    height?: number;
    baseShader?: Shader;
    antialias?: boolean;
    debugMode?: boolean;
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

export class WebGLRenderPipeline implements IRenderPipeline {
    private _renderQueue: RenderQueue = [];
    private _activeQueueStack: RenderQueue[] = [];
    private _debugMode: boolean = false;
    private _maskLayer: MaskLayer;

    public _width: number;
    public _height: number;

    public readonly view: HTMLCanvasElement;
    public readonly context: WebGLPipelineRenderContext;

    public get width() {
        return this._width;
    }
    public get height() {
        return this._height;
    }

    public get maskLayer() {
        return this._maskLayer;
    }

    public readonly globalShaderData: GlobalShaderData;
    public readonly baseShader: Shader;
    public readonly shaderPipeline: ShaderPipeline;

    constructor(options?: WebGLRenderPipelineOptions) {
        options = options || {};

        this._debugMode = options.debugMode || false;
        this.view = options.view || document.createElement('canvas');

        let context: WebGLRenderingContext | null = this.view.getContext('webgl', {
            antialias: options.antialias || false
        });

        if (!context) {
            throw new RenderingContextError('Could not get rendering context');
        }

        if (this._debugMode) {
            try {
                context = WebGLDebugUtils.makeDebugContext(context);
                tagContext(context);
            } catch (err) {
                console.error(err);
            }
        }

        context.enable(context.BLEND);
        context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);

        this.context = new WebGLPipelineRenderContext(context, this._debugMode);

        this._width = options.width || 800;
        this._height = options.height || 600;

        this.view.width = this.width;
        this.view.height = this.height;

        resetViewport(context, this._debugMode);

        this.globalShaderData = new GlobalShaderData(this);
        this.baseShader = options.baseShader || new DefaultShader(this);
        this.shaderPipeline = new ShaderPipeline(this);

        // this.globalShaderData.setUniform('u_resolution', [this.view.width, this.view.height]);

        this._activeQueueStack.push(this._renderQueue);

        this._maskLayer = new MaskLayer(this);
    }

    public setViewContainer(container: Element) {
        if (this.view.parentElement) {
            this.view.parentElement.removeChild(this.view);
        }
        container.appendChild(this.view);
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
            throw new RenderPipelineRanOutOfContainersError();
        }
        this._activeQueueStack.pop();
    }

    /**
     * Draws every enqueued item
     */
    public drawFrame() {
        this._maskLayer.clearMaskLayer();
        this.context.clearViewport(Color.Transparent);
        sortQueueItems(this._renderQueue);
        for (const item of this._renderQueue) {
            drawQueueItem(item);
        }
        this.clearRenderQueue();
    }

    public resizeView(width: number, height: number) {
        this._width = width;
        this._height = height;

        this.view.width = width;
        this.view.height = height;

        this.context.resetViewport(width, height);
    }
}
