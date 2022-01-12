import { taggedMessage } from "./context-debug";

export function resetViewport(gl: WebGLRenderingContext, debug?: boolean) {
    if (debug) {
        taggedMessage(gl, 'Resetting Viewport', false, [gl.canvas.width, gl.canvas.height]);
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}