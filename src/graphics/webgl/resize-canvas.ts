/**
 * Resize a canvas to match the size its displayed.
 * 
 * @param canvas The canvas to resize.
 * @param multiplier amount to multiply by. Pass in `window.devicePixelRatio` for native pixels.
 * @return `true` if the canvas was resized.
 * @memberOf module:webgl-utils
 */
export function resizeCanvas(canvas: HTMLCanvasElement, multiplier?: number) {
    multiplier = multiplier || 1;
    const width = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}