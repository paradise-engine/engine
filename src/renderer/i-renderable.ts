import { IRenderer } from "./i-renderer";

export interface IRenderable {
    render(renderer: IRenderer): void;
}