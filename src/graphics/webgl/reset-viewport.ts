export function resetViewport(gl: WebGLRenderingContext) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}