import type { Renderer } from "../renderer";
import { Shader } from "../webgl";
import defaultVert from './default.vert';
import defaultFrag from './default.frag';

export class DefaultShader extends Shader {
    constructor(renderer: Renderer, vertexSource?: string, fragmentSource?: string) {
        super(
            renderer.context,
            vertexSource || defaultVert,
            fragmentSource || defaultFrag,
            renderer.globalShaderData.bufferInfo
        );
    }
}