import { Dictionary } from "../../util";
import { TypedArrayConstructor } from "./typed-array";

export type BufferInput = Dictionary<BufferInputData>;

export interface BufferInputData {
    numComponents: number;
    data: number[];
    type: TypedArrayConstructor;
}