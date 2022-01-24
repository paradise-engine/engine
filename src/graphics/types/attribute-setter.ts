import { Dictionary } from "../../util";
import { AttributeData } from "./attribute-data";

export type AttributeSetterFunction = (value: AttributeData) => void;
export type AttributeSetters = Dictionary<AttributeSetterFunction>;