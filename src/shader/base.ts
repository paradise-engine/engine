import { BufferInfo, createBufferInfo, Shader } from "../webgl";
import vert from './base.vert';
import frag from './base.frag';
import type { Renderer } from "../renderer/renderer";

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

export class BaseShader extends Shader {
    private _bufferInfo: BufferInfo;

    constructor(renderer: Renderer) {
        super(renderer.context, vert, frag);
        this._bufferInfo = createBufferInfo(renderer.context, {
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
        });

        this.updateAttributes(this._bufferInfo);
    }
}
