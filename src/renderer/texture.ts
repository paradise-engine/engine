import { ResourceType } from "../resource";
import { RenderingContextError } from "../errors";

export type TextureType = ResourceType.Image | ResourceType.Video;

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}

function initVideoTexture(gl: WebGLRenderingContext) {
    const texture = gl.createTexture();

    if (texture === null) {
        throw new RenderingContextError('Could not create WebGLTexture');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because video has to be download over the internet
    // they might take a moment until it's ready so
    // put a single pixel in the texture so we can
    // use it immediately.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    // Turn off mips and set wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}


function initImageTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
    const texture = gl.createTexture();

    if (texture === null) {
        throw new RenderingContextError('Could not create WebGLTexture');
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    return texture;
}


export class Texture {

    public static createVideoTexture(gl: WebGLRenderingContext, video: HTMLVideoElement) {
        const texture = initVideoTexture(gl);
        return new Texture(texture, ResourceType.Video, video);
    }

    public static createImageTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
        const texture = initImageTexture(gl, image);
        return new Texture(texture, ResourceType.Image, image);
    }

    public readonly glTexture: WebGLTexture;
    public readonly type: TextureType;
    public readonly srcElement: HTMLImageElement | HTMLVideoElement;

    private constructor(glTexture: WebGLTexture, type: TextureType, srcElement: HTMLImageElement | HTMLVideoElement) {
        this.glTexture = glTexture;
        this.type = type;
        this.srcElement = srcElement;
    }

}