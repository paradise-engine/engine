import { Dictionary } from "../../util";
import { Shader } from "../shader";
import { NativeTexture } from "./native-texture";
import { UniformData } from "./uniform-data";

export interface DrawImageOptions {
    /**
     * The Shader to use for rendering
     */
    shader: Shader;
    /**
     * Global uniforms to pass into shader program
     */
    globalUniforms: Dictionary<UniformData>;
    /**
     * The texture to receive color information from
     */
    texture: NativeTexture;
    /**
     * The original width of the texture
     */
    textureWidth: number;
    /**
     * The original height of the texture
     */
    textureHeight: number;
    /**
     * The x-location of the texture section to render
     */
    sourceX?: number;
    /**
     * The y-location of the texture section to render
     */
    sourceY?: number;
    /**
     * The width of the texture section to render
     */
    sourceWidth?: number;
    /**
    * The height of the texture section to render
    */
    sourceHeight?: number;
    /**
     * The destination x-location on the canvas in pixels
     */
    destinationX: number;
    /**
     * The destination y-location on the canvas in pixels
     */
    destinationY: number;
    /**
     * The destination width to render in pixels. Defaults to `textureWidth`
     */
    destinationWidth?: number;
    /**
     * The destination height to render in pixels. Defaults to `textureHeight`
     */
    destinationHeight?: number;
    /**
     * The angle to rotate by in radians (clockwise)
     */
    rotationRadian?: number;
    /**
     * The x-location of the rotation center, with `0` being the left edge of the rect
     */
    rotationOffsetX?: number;
    /**
     * The y-location of the rotation center, with `0` being the top edge of the rect
     */
    rotationOffsetY?: number;
    /**
     * Flip Y
     */
    flipY?: boolean;
}