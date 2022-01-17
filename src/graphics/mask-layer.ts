import { Color } from "../data-structures";
import { MaskLayerOutOfBoundsError } from "../errors";
import { colorGenerator, Dictionary, randomInteger } from "../util";
import { IRenderContext } from "./i-render-context";
import { IRenderPipeline } from "./i-render-pipeline";
import { SolidShader } from "./shader";
import { DrawImageOptions, NativeFramebuffer, NativeTexture } from "./types";

const MAX_USED_COLORS = Math.pow(256, 3);

export class MaskLayer {
    private _context: IRenderContext;
    private _pipeline: IRenderPipeline;
    private _fbo: NativeFramebuffer;
    private _maskTexture: NativeTexture;
    private _maskMap: Map<string, string> = new Map();

    private _colorCache: Dictionary<Color> = {}; // re-use created colors
    private _colorGen = colorGenerator();

    private _shader: SolidShader;

    constructor(pipeline: IRenderPipeline) {
        this._context = pipeline.context;
        this._pipeline = pipeline;
        this._fbo = pipeline.context.createFramebuffer();
        this._maskTexture = pipeline.context.createGeneralPurposeTexture();

        this._context.attachTextureToFramebuffer(this._maskTexture, this._fbo);

        this._shader = new SolidShader(pipeline);
        this.clearMaskLayer();
    }

    private _getNextColor(): Color {
        const colorCompsResult = this._colorGen.next();
        if (colorCompsResult.done) {
            throw new MaskLayerOutOfBoundsError();
        }

        const comps = colorCompsResult.value;
        const colorId = comps.join('_');

        let cached = this._colorCache[colorId];

        if (!cached) {
            cached = new Color(comps[0], comps[1], comps[2]);
            this._colorCache[colorId] = cached;
        }

        return cached;
    }

    public setRenderPipeline(pipeline: IRenderPipeline) {
        this._pipeline = pipeline;
        this._context = pipeline.context;

        this._fbo = pipeline.context.createFramebuffer();
        this._maskTexture = pipeline.context.createGeneralPurposeTexture();
        this._context.attachTextureToFramebuffer(this._maskTexture, this._fbo);
        this._shader = new SolidShader(pipeline);
        this.clearMaskLayer();
    }

    public clearMaskLayer() {
        this._context.clearFramebuffer(this._fbo, Color.Transparent);
        this._maskMap.clear();
        this._colorGen = colorGenerator();

        this._context.bindTexture(this._maskTexture);
        this._context.specifyTextureImage(this._pipeline.view.width, this._pipeline.view.height);
    }

    public addObjectToMaskLayer(objectId: string, options: DrawImageOptions) {
        const color = this._getNextColor();
        this._shader.setColor(color);

        const uniqueString = `${color.hex}_${color.alpha}`;

        this._maskMap.set(uniqueString, objectId);

        this._context.bindFramebuffer(this._fbo);

        this._context.drawImage({
            ...options,
            shader: this._shader
        });

        this._context.bindFramebuffer(null);
    }

    public probePosition(posX: number, posY: number): string | undefined {
        const color = this._context.readPixel(posX, posY, this._fbo);
        const uniqueString = `${color.hex}_${color.alpha}`;
        const id = this._maskMap.get(uniqueString);

        console.log(`Probing ${posX}, ${posY} - ${uniqueString}`);

        return id;
    }
}