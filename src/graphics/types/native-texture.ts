import { NativePrimitive } from "./native-primitive";

export type NativeTexture = NativePrimitive<'texture'>;

export interface NativeVideoTextureInfo {
    texture: NativeTexture;
    update: () => void;
}

export interface NativeTextureInfo {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    texture: NativeTexture;
}