import { mat4 } from 'gl-matrix';
import { Dictionary } from "../../util";
import { InactiveShaderError } from "../../errors";
import { DrawImageOptions, UniformData } from '../types';
import { Shader, ShaderState } from '../shader';
import { taggedMessage } from './context-debug';

/**
 * Tell WebGL to use the program of the specified shader and update shader uniforms
 * @param gl 
 * @param shader 
 * @param globalUniforms 
 */
function prepareShader(gl: WebGLRenderingContext, shader: Shader, globalUniforms: Dictionary<UniformData>, localUniforms: Dictionary<UniformData>, debug?: boolean) {
    if (shader.state === ShaderState.Inactive) {
        throw new InactiveShaderError();
    }

    let uniforms: Dictionary<UniformData>[] = [
        globalUniforms
    ];

    if (shader.state === ShaderState.Dirty) {
        uniforms.push(shader.uniforms);
    }

    uniforms.push(localUniforms);

    gl.useProgram(shader.program.program);

    shader.updateAttributes();
    shader.updateUniforms(...uniforms);
    shader.setPristine();

    if (debug) {
        taggedMessage(gl, 'Using Program', true, shader.program.program);
    }
}

export function drawToFramebuffer(gl: WebGLRenderingContext, globalUniforms: Dictionary<UniformData>, shader: Shader, texture: WebGLTexture, debug?: boolean) {
    const identityMatrix = mat4.create();

    const localUniforms = {
        'u_matrix': identityMatrix,
        'u_texture': texture
    }

    prepareShader(gl, shader, globalUniforms, localUniforms, debug);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export interface WebGLDrawImageOptions extends DrawImageOptions {
    /**
     * The WebGL rendering context
     */
    gl: WebGLRenderingContext;
    debug?: boolean;
}

export function drawImage(options: WebGLDrawImageOptions) {
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
    mat4.ortho(matrix, 0, gl.canvas.width, options.flipY ? 0 : gl.canvas.height, options.flipY ? gl.canvas.height : 0, -1, 1);
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
        'u_texture': options.texture.texture
    }, options.debug);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
