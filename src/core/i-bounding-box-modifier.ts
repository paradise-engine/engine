import { Rect } from "./rect";

export interface IBoundingBoxModifier {
    getBoundingBox(): Rect;
}