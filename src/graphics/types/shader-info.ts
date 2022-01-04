import { NativeShader } from "./native-shader";
import { NativeShaderProgram } from "./native-shader-program";

export interface ShaderInfo {
    program: NativeShaderProgram;
    vertexShader: NativeShader;
    fragmentShader: NativeShader;
}