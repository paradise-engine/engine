import type { WebGLRenderPipeline } from '../../webgl-render-pipeline';
import defaultVert from '../default.vert';
import frag from './alpha.frag';
import { DefaultShader } from "../default-shader";

export class AlphaShader extends DefaultShader {
    constructor(renderPipeline: WebGLRenderPipeline, alpha: number = 1.0) {
        super(renderPipeline, defaultVert, frag);
        this.uniforms['u_alpha'] = alpha;
    }
}