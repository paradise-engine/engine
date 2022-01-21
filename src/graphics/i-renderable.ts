import { Vector } from "../data-structures";
import { IRenderPipeline } from "./i-render-pipeline";

export interface IRenderable {
    render(renderPipeline: IRenderPipeline, viewportOrigin: Vector): void;
}