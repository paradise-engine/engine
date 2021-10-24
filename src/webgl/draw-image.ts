import { ProgramInfo } from "./program-info";
import { mat4 } from 'gl-matrix';
import { Shader, ShaderState } from "./shader";
import { Dictionary } from "../util";
import { UniformData } from "./uniform-setters";
import { InactiveShaderError } from "../errors";

export function drawToFramebuffer(gl: WebGLRenderingContext, globalUniforms: Dictionary<UniformData>, shader: Shader, texture: WebGLTexture) {
    if (shader.state === ShaderState.Inactive) {
        throw new InactiveShaderError();
    }

    gl.useProgram(shader.program);

    let uniforms: Dictionary<UniformData> = {
        ...globalUniforms
    };

    if (shader.state === ShaderState.Dirty) {
        uniforms = {
            ...uniforms,
            ...shader.uniforms
        }
    }

    const identityMatrix = mat4.create();

    uniforms = {
        ...uniforms,
        'u_matrix': identityMatrix,
        'u_texture': texture
    }

    shader.updateUniforms(uniforms);
    shader.setPristine();

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Unlike images, textures do not have a width and height associated
// with then so we'll pass in the width and height of the teture
export function drawImage(gl: WebGLRenderingContext, programInfo: ProgramInfo, tex: WebGLTexture, texWidth: number, texHeight: number, dstX: number, dstY: number) {
    // Tell WebGL to use our shader program pair
    gl.useProgram(programInfo.shader.program);

    const shader = programInfo.shader;
    shader.updateAttributes(programInfo.bufferInfo);

    // this matrix will convert from pixels to clip space
    const matrix = mat4.create();
    mat4.ortho(matrix, 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    mat4.translate(matrix, matrix, [dstX, dstY, 0]);
    mat4.scale(matrix, matrix, [texWidth, texHeight, 1]);

    shader.updateUniforms({
        'u_matrix': matrix,
        'u_texture': tex
    });

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, programInfo.bufferInfo.numElements);
}

/*
interface DrawInfo {
    x: number;
    y: number;
    dx: number;
    dy: number;
    textureInfo: TextureInfo;
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
            textureInfo: textureInfos[Math.random() * textureInfos.length | 0]
        }
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

    function draw() {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const p = setup(gl);

        const pi: ProgramInfo = {
            program: p.program,
            attributeSetters: p.attribSetters,
            uniformSetters: p.uniformSetters,
            bufferInfo: p.bufferInfo,
            uniformInfo: {}
        }

        drawInfos.forEach(function (drawInfo) {
            drawImage(
                gl,
                pi,
                drawInfo.textureInfo.texture,
                drawInfo.textureInfo.width,
                drawInfo.textureInfo.height,
                drawInfo.x,
                drawInfo.y
            );
        });
    }

    let t = 0;
    function render(time: number) {
        const now = time * 0.001;
        const deltaTime = Math.min(0.1, now - t);
        t = now;

        update(deltaTime);
        draw();

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
*/