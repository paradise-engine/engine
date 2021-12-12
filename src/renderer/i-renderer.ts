export interface IRenderer {
    clearRenderQueue(): void;
    enqueueRenderable(worldSpacePosition: [number, number], renderFn: () => void): void;
    openContainer(worldSpacePosition: [number, number]): void;
    closeContainer(): void;
    drawFrame(): void;
}