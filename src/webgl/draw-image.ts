import { mat4 } from 'gl-matrix';
import { Shader, ShaderState } from "./shader";
import { Dictionary } from "../util";
import { UniformData } from "./uniform-setters";
import { InactiveShaderError } from "../errors";

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

/*

// Some demo code to test if rendering actually works

import { createBufferInfo } from "./create-buffer-info";

interface DrawInfo {
    x: number;
    y: number;
    dx: number;
    dy: number;
    xScale: number;
    yScale: number;
    offX: number;
    offY: number;
    width: number;
    height: number;
    textureInfo: TextureInfo;
}

interface TextureInfo {
    texture: WebGLTexture,
    width: number;
    height: number;
}

export function drawRandom(gl: WebGLRenderingContext, textureInfos: TextureInfo[]) {

    const drawInfos: DrawInfo[] = [];
    const numToDraw = 9;
    const speed = 60;

    for (let i = 0; i < numToDraw; i++) {
        const drawInfo = {
            x: Math.random() * gl.canvas.width,
            y: Math.random() * gl.canvas.height,
            dx: Math.random() > 0.5 ? -1 : 1,
            dy: Math.random() > 0.5 ? -1 : 1,
            xScale: Math.random() * 0.25 + 0.25,
            yScale: Math.random() * 0.25 + 0.25,
            offX: Math.random() * 0.75,
            offY: Math.random() * 0.75,
            textureInfo: textureInfos[Math.random() * textureInfos.length | 0],
            width: 0,
            height: 0
        }
        drawInfo.width = Math.random() * (1 - drawInfo.offX);
        drawInfo.height = Math.random() * (1 - drawInfo.offY);

        drawInfos.push(drawInfo);
    }

    function update(deltaTime: number) {
        drawInfos.forEach(function (drawInfo) {
            drawInfo.x += drawInfo.dx * speed * deltaTime;
            drawInfo.y += drawInfo.dy * speed * deltaTime;
            if (drawInfo.x < 0) {
                drawInfo.dx = 1;
            }
            if (drawInfo.x >= gl.canvas.width) {
                drawInfo.dx = -1;
            }
            if (drawInfo.y < 0) {
                drawInfo.dy = 1;
            }
            if (drawInfo.y >= gl.canvas.height) {
                drawInfo.dy = -1;
            }
        });
    }

    const vs = `
        attribute vec4 a_position;
        attribute vec2 a_texcoord;

        uniform mat4 u_matrix;
        uniform mat4 u_textureMatrix;

        varying vec2 v_texcoord;

        void main(void) {
            gl_Position = u_matrix * a_position;
            v_texcoord = (u_textureMatrix * vec4(a_texcoord, 0, 1)).xy;
        }
        `;

    const fs = `
            precision mediump float;

            varying vec2 v_texcoord;

            uniform sampler2D u_texture;

            void main() {
                gl_FragColor = texture2D(u_texture, v_texcoord);
            }
        `;

    const BASE_POSITION = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1
    ];

    const BASE_TEXCOORD = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1
    ];

    const bufferInput = {
        'a_position': {
            numComponents: 2,
            data: BASE_POSITION,
            type: Float32Array
        },
        'a_texcoord': {
            numComponents: 2,
            data: BASE_TEXCOORD,
            type: Float32Array
        }
    }

    const shader = new Shader(gl, vs, fs, createBufferInfo(gl, bufferInput));

    function draw() {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        drawInfos.forEach(function (drawInfo) {
            const dstWidth = drawInfo.textureInfo.width * drawInfo.xScale;
            const dstHeight = drawInfo.textureInfo.height * drawInfo.yScale;

            var srcX = drawInfo.textureInfo.width * drawInfo.offX;
            var srcY = drawInfo.textureInfo.height * drawInfo.offY;
            var srcWidth = drawInfo.textureInfo.width * drawInfo.width;
            var srcHeight = drawInfo.textureInfo.height * drawInfo.height;

            drawImage({
                gl,
                shader,
                globalUniforms: {},
                texture: drawInfo.textureInfo.texture,
                textureWidth: drawInfo.textureInfo.width,
                textureHeight: drawInfo.textureInfo.height,
                destinationX: drawInfo.x,
                destinationY: drawInfo.y,
                destinationWidth: dstWidth,
                destinationHeight: dstHeight,
                sourceX: srcX,
                sourceY: srcY,
                sourceWidth: srcWidth,
                sourceHeight: srcHeight
            });
        });
    }

    let t = 0;
    let lastRender = 0;

    let fpsSamples: number[] = [];
    const fpsContainer = document.getElementById('fps') as HTMLDivElement;

    function sampleFps(fps: number) {
        fpsSamples.push(fps);
        if (fpsSamples.length === 10) {
            const sum = fpsSamples.reduce((prev, curr) => prev + curr, 0);
            let avg = sum / fpsSamples.length;
            avg = parseInt(avg.toString(), 10);

            fpsSamples.splice(0, fpsSamples.length);

            fpsContainer.textContent = avg.toString();
        }
    }

    function render(time: number) {
        const now = time * 0.001;
        const deltaTime = Math.min(0.1, now - t);
        t = now;

        update(deltaTime);
        draw();

        if (lastRender !== 0) {
            const msSinceLastRender = time - lastRender;
            const fps = 1000 / msSinceLastRender;
            sampleFps(fps);
        }
        lastRender = time;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
*/