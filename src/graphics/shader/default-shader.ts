import type { WebGLRenderPipeline } from "../webgl-render-pipeline";
import { Shader } from "../webgl";
import defaultVert from './default.vert';
import defaultFrag from './default.frag';

export class DefaultShader extends Shader {
    constructor(renderPipeline: WebGLRenderPipeline, vertexSource?: string, fragmentSource?: string) {
        super(
            renderPipeline.context,
            vertexSource || defaultVert,
            fragmentSource || defaultFrag,
            renderPipeline.globalShaderData.bufferInfo
        );
    }
}