import { Renderer } from "./renderer";

export interface IRenderable {
    render(renderer: Renderer): void;
}