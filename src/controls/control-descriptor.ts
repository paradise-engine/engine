export type TypeConstructor = new (...args: any[]) => any;

export interface BaseControlOptions {
    hiddenInInspector?: boolean;
}

export interface NumberControlOptions extends BaseControlOptions {
    min?: number;
    max?: number;
    step?: number;
    asInteger?: boolean;
}

export interface StringControlOptions extends BaseControlOptions {
    minLength?: number;
    maxLength?: number;
}

export interface SelectControlChoice {
    value: string;
    displayValue: string;
}

export interface SelectControlOptions extends BaseControlOptions {
    choices: SelectControlChoice[];
}

export interface ControlDescriptor<T extends BaseControlOptions = BaseControlOptions> {
    propertyKey: string;
    displayName: string;
    dataType: TypeConstructor;
    options: T;
}
