import { IRenderPipeline } from "./i-render-pipeline";

export interface IRenderable {
    render(renderPipeline: IRenderPipeline<any>): void;
}