import defaultVert from './default.vert';
import defaultFrag from './default.frag';
import { Shader } from './shader';
import { IRenderPipeline } from '../i-render-pipeline';

export class DefaultShader extends Shader {
    constructor(renderPipeline: IRenderPipeline, vertexSource?: string, fragmentSource?: string) {
        super(
            renderPipeline.context,
            vertexSource || defaultVert,
            fragmentSource || defaultFrag,
            renderPipeline.globalShaderData.bufferInfo
        );
    }
}