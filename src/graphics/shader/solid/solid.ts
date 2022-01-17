import defaultVert from '../default.vert';
import frag from './solid.frag';
import { DefaultShader } from "../default-shader";
import { IRenderPipeline } from '../../i-render-pipeline';
import { Color } from '../../../data-structures';

export class SolidShader extends DefaultShader {
    constructor(renderPipeline: IRenderPipeline, color: Color = Color.White) {
        super(renderPipeline, defaultVert, frag);
        this.uniforms['u_color'] = color.getNormalized()
    }

    public setColor(color: Color) {
        this.uniforms['u_color'] = color.getNormalized()
    }
}