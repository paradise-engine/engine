import type { Renderer } from '../../renderer';
import defaultVert from '../default.vert';
import frag from './alpha.frag';
import { DefaultShader } from "../default-shader";

export class AlphaShader extends DefaultShader {
    constructor(renderer: Renderer, alpha: number = 1.0) {
        super(renderer, defaultVert, frag);
        this.uniforms['u_alpha'] = alpha;
    }
}