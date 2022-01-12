import { glEnumToString } from "./gl-enum-to-string";
import { RenderingContextError } from "../../errors";
import { registerContextObject, taggedMessage } from "./context-debug";

/**
 * Creates and compiles a shader.
 *
 * @param gl The WebGL Context.
 * @param shaderSource The GLSL source code for the shader.
 * @param shaderType The type of shader, VERTEX_SHADER or FRAGMENT_SHADER
 * @return The shader.
 */
function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number, debug?: boolean) {
    // Create the shader object
    const shader = gl.createShader(shaderType);

    if (shader === null) {
        throw new RenderingContextError(`Could not create WebGLShader type ${glEnumToString(gl, shaderType)}`);
    }

    if (debug) {
        registerContextObject(gl, shader, 'Created Shader');
    }

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check if it compiled
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        // Something went wrong during compilation; get the error
        throw new RenderingContextError(`Could not compile WebGLShader: ${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
}

/**
 * Creates and links a program from 2 shaders.
 *
 * @param gl The WebGL context.
 * @param vertexShader A vertex shader.
 * @param fragmentShader A fragment shader.
 * @return A program.
 */
function linkShaderProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, debug?: boolean) {
    // create a program.
    const program = gl.createProgram();

    if (program === null) {
        throw new RenderingContextError('Could not create WebGLProgram');
    }

    if (debug) {
        registerContextObject(gl, program, 'Created Program');
    }

    // attach the shaders.
    if (debug) {
        taggedMessage(gl, 'Attaching Shaders to Program', true, program, vertexShader, fragmentShader);
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    // Check if it linked.
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link
        throw new RenderingContextError(`WebGLProgram failed to link: ${gl.getProgramInfoLog(program)}`);
    }

    return program;
};

/**
 * Compiles shaders and links program.
 *
 * @param gl The WebGL Context.
 * @param vsSource The GLSL source code for the vertex shader.
 * @param fsSource The GLSL source code for the fragment shader.
 * @return The program.
 */
export function createShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string, debug?: boolean) {
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER, debug);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER, debug);
    const program = linkShaderProgram(gl, vertexShader, fragmentShader, debug);

    return { vertexShader, fragmentShader, program };
}