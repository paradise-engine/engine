import { resetViewport, tagContext } from "../webgl";
import { RenderingContextError, RenderLayerNotFoundError } from "../../errors";
import { DefaultShader, Shader } from '../shader';
import { ShaderPipeline } from "../shader-pipeline";
import { GlobalShaderData } from "../global-shader-data";
import { WebGLPipelineRenderContext } from "./webgl-render-context";
import { WebGLDebugUtils } from './webgl_debug';
import { MaskLayer } from "../mask-layer";
import { Color } from "../../data-structures";
import { IRenderPipeline, RenderPipelineEnqueueOptions } from "../i-render-pipeline";
import { RenderLayer } from "../render-layer";
import { Indexable } from "../../util";
import { BuiltinLayers } from "../builtin-layers";

export interface WebGLRenderPipelineOptions {
    view?: HTMLCanvasElement;
    width?: number;
    height?: number;
    baseShader?: Shader;
    antialias?: boolean;
    debugMode?: boolean;
    customLayers?: RenderLayer[];
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
    private _renderQueues: Indexable<RenderQueue> = {};
    private _debugMode: boolean = false;
    private _maskLayer: MaskLayer;
    private _layers: RenderLayer[] = [];
    private _defaultLayer: number;

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

    public get layers() {
        return this._layers.slice();
    }

    public get defaultLayer() {
        return this._defaultLayer;
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

        this.addLayer({
            index: Number.MIN_SAFE_INTEGER,
            name: 'Background Gizmo',
            hideInEditor: true
        });

        this.addLayer({
            index: BuiltinLayers.Default,
            name: 'Default'
        });

        this.addLayer({
            index: Number.MAX_SAFE_INTEGER,
            name: 'Foreground Gizmo',
            hideInEditor: true
        });

        this._defaultLayer = BuiltinLayers.Default;

        this._maskLayer = new MaskLayer(this);
    }

    public setViewContainer(container: Element) {
        if (this.view.parentElement) {
            this.view.parentElement.removeChild(this.view);
        }
        container.appendChild(this.view);
    }

    public clearRenderQueue() {
        for (const layer of this._layers) {
            this._renderQueues[layer.index] = [];
        }
    }

    public addLayer(layer: RenderLayer) {
        const existing = this._layers.find(l => l.index === layer.index);
        if (!existing) {
            this._layers.push(layer);
            this._layers.sort((a, b) => {
                if (a.index <= b.index) {
                    return -1;
                }
                return 1;
            });

            if (!this._renderQueues[layer.index]) {
                this._renderQueues[layer.index] = [];
            }
        }
    }

    public setDefaultLayer(layerIndex: number) {
        const existing = this._layers.find(l => l.index === layerIndex);
        if (!existing) {
            throw new RenderLayerNotFoundError(layerIndex);
        }

        this._defaultLayer = layerIndex;
    }

    public enqueueRenderable(options: RenderPipelineEnqueueOptions, renderFn: () => void) {
        const layer = options.layer || this._defaultLayer;
        const queue = this._renderQueues[layer];

        if (!queue) {
            throw new RenderLayerNotFoundError(layer);
        }

        queue.push({
            worldSpacePosition: options.worldSpacePosition,
            renderFn
        });
    }

    /**
     * Draws every enqueued item
     */
    public drawFrame() {
        this._maskLayer.clearMaskLayer();
        this.context.clearViewport(Color.Transparent);

        for (const layer of this._layers) {
            const queue = this._renderQueues[layer.index];
            if (!queue) {
                throw new RenderLayerNotFoundError(layer.index);
            }

            sortQueueItems(queue);
            for (const item of queue) {
                drawQueueItem(item);
            }
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
