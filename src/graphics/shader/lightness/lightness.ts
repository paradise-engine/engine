import defaultVert from '../default.vert';
import frag from './lightness.frag';
import { DefaultShader } from "../default-shader";
import { IRenderPipeline } from '../../i-render-pipeline';

export class LightnessShader extends DefaultShader {
    constructor(renderPipeline: IRenderPipeline, lightnessFactor: number = 1.0) {
        super(renderPipeline, defaultVert, frag);
        this.uniforms['u_lightness'] = lightnessFactor;
    }

    public setLightnessFactor(lightnessFactor: number) {
        this.uniforms['u_lightness'] = lightnessFactor;
    }
}