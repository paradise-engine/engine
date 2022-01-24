import defaultVert from '../default.vert';
import frag from './alpha.frag';
import { DefaultShader } from "../default-shader";
import { IRenderPipeline } from '../../i-render-pipeline';

export class AlphaShader extends DefaultShader {
    constructor(renderPipeline: IRenderPipeline, alpha: number = 1.0) {
        super(renderPipeline, defaultVert, frag);
        this.uniforms['u_alpha'] = alpha;
    }
}