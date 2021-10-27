import { mat4 } from 'gl-matrix';
import { Shader, ShaderState } from "./shader";
import { Dictionary } from "../../util";
import { UniformData } from "./uniform-setters";
import { InactiveShaderError } from "../../errors";

/**
 * Tell WebGL to use the program of the specified shader and update shader uniforms
 * @param gl 
 * @param shader 
 * @param globalUniforms 
 */
function prepareShader(gl: WebGLRenderingContext, shader: Shader, globalUniforms: Dictionary<UniformData>, localUniforms: Dictionary<UniformData>) {
    if (shader.state === ShaderState.Inactive) {
        throw new InactiveShaderError();
    }

    gl.useProgram(shader.program);

    let uniforms: Dictionary<UniformData>[] = [
        globalUniforms
    ];

    if (shader.state === ShaderState.Dirty) {
        uniforms.push(shader.uniforms);
    }

    uniforms.push(localUniforms);

    shader.updateAttributes();
    shader.updateUniforms(...uniforms);
    shader.setPristine();
}

export function drawToFramebuffer(gl: WebGLRenderingContext, globalUniforms: Dictionary<UniformData>, shader: Shader, texture: WebGLTexture) {
    const identityMatrix = mat4.create();

    const localUniforms = {
        'u_matrix': identityMatrix,
        'u_texture': texture
    }

    prepareShader(gl, shader, globalUniforms, localUniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export interface DrawImageOptions {
    /**
     * The WebGL rendering context
     */
    gl: WebGLRenderingContext;
    /**
     * The Shader to use for rendering
     */
    shader: Shader;
    /**
     * Global uniforms to pass into shader program
     */
    globalUniforms: Dictionary<UniformData>;
    /**
     * The texture to receive color information from
     */
    texture: WebGLTexture;
    /**
     * The original width of the texture
     */
    textureWidth: number;
    /**
     * The original height of the texture
     */
    textureHeight: number;
    /**
     * The x-location of the texture section to render
     */
    sourceX?: number;
    /**
     * The y-location of the texture section to render
     */
    sourceY?: number;
    /**
     * The width of the texture section to render
     */
    sourceWidth?: number;
    /**
    * The height of the texture section to render
    */
    sourceHeight?: number;
    /**
     * The destination x-location on the canvas in pixels
     */
    destinationX: number;
    /**
     * The destination y-location on the canvas in pixels
     */
    destinationY: number;
    /**
     * The destination width to render in pixels. Defaults to `textureWidth`
     */
    destinationWidth?: number;
    /**
     * The destination height to render in pixels. Defaults to `textureHeight`
     */
    destinationHeight?: number;
    /**
     * The angle to rotate by in radians (clockwise)
     */
    rotationRadian?: number;
    /**
     * The x-location of the rotation center, with `0` being the left edge of the rect
     */
    rotationOffsetX?: number;
    /**
     * The y-location of the rotation center, with `0` being the top edge of the rect
     */
    rotationOffsetY?: number;
}


export function drawImage(options: DrawImageOptions) {
    const gl = options.gl;

    if (options.destinationWidth === undefined) {
        options.destinationWidth = options.textureWidth;
    }

    if (options.destinationHeight === undefined) {
        options.destinationHeight = options.textureHeight;
    }

    if (options.sourceX === undefined) {
        options.sourceX = 0;
    }

    if (options.sourceY === undefined) {
        options.sourceY = 0;
    }

    if (options.sourceWidth === undefined) {
        options.sourceWidth = options.textureWidth;
    }

    if (options.sourceHeight === undefined) {
        options.sourceHeight = options.textureHeight;
    }

    if (options.rotationRadian === undefined) {
        options.rotationRadian = 0;
    }

    if (options.rotationOffsetX === undefined) {
        options.rotationOffsetX = 0;
    }

    if (options.rotationOffsetY === undefined) {
        options.rotationOffsetY = 0;
    }

    const scaleX = options.sourceWidth / options.destinationWidth;
    const scaleY = options.sourceHeight / options.destinationHeight;

    const rotationOffsetMatrix = mat4.create();
    mat4.fromRotation(rotationOffsetMatrix, options.rotationRadian, [0, 0, 1]);
    mat4.translate(rotationOffsetMatrix, rotationOffsetMatrix, [-options.rotationOffsetX / scaleX, -options.rotationOffsetY / scaleY, 0]);

    const matrix = mat4.create();
    mat4.ortho(matrix, 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    mat4.translate(matrix, matrix, [options.destinationX, options.destinationY, 0]);
    mat4.rotate(matrix, matrix, options.rotationRadian, [0, 0, 1]);
    mat4.multiply(matrix, matrix, rotationOffsetMatrix);
    mat4.scale(matrix, matrix, [options.destinationWidth, options.destinationHeight, 1]);

    const texMatrix = mat4.create();
    mat4.fromTranslation(texMatrix, [options.sourceX / options.textureWidth, options.sourceY / options.textureHeight, 0]);
    mat4.scale(texMatrix, texMatrix, [options.sourceWidth / options.textureWidth, options.sourceHeight / options.textureHeight, 1]);

    prepareShader(gl, options.shader, options.globalUniforms, {
        'u_matrix': matrix,
        'u_textureMatrix': texMatrix,
        'u_texture': options.texture
    });

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
