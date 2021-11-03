import 'reflect-metadata';
import { InvalidControlTypeError } from '../errors';
import { BaseControlOptions, ControlDescriptor, TypeConstructor } from "./control-descriptor";
import { isControlType } from "./control-type";

export const ValidPrimitiveTypes: TypeConstructor[] = [
    Boolean,
    Number,
    String
];

export interface ControlDecoratorOptions<T extends BaseControlOptions> {
    name?: string;
    options: T;
}

const MKEY_CONTROL_DESCRIPTORS = 'paradise:control_descriptors';

function camelCaseToDisplay(str: string): string {
    return str
        .replace('_', ' ')
        .replace(/[A-Z]/g, letter => ` ${letter}`)
        .replace(/\b[A-Za-z]/g, letter => letter.toUpperCase())
        .trim();
}

export function Control<T extends BaseControlOptions>(options?: ControlDecoratorOptions<T>) {
    return function ControlDecorator(target: any, propertyKey: string) {
        const descriptors: ControlDescriptor[] = Reflect.getMetadata(MKEY_CONTROL_DESCRIPTORS, target) || [];
        const type = Reflect.getMetadata('design:type', target, propertyKey) as TypeConstructor;

        const isControl = isControlType(type);

        if (ValidPrimitiveTypes.indexOf(type) === -1 && !isControl) {
            throw new InvalidControlTypeError(type.name || (type.toString ? type.toString() : type as unknown as string));
        }

        const descriptor: ControlDescriptor = {
            propertyKey: propertyKey,
            displayName: options?.name || camelCaseToDisplay(propertyKey),
            dataType: type,
            options: options?.options || {}
        }

        descriptors.push(descriptor);
        Reflect.defineMetadata(MKEY_CONTROL_DESCRIPTORS, descriptors, target);
    }
}

export function getControlDescriptors(target: any): ControlDescriptor[] {
    return Reflect.getMetadata(MKEY_CONTROL_DESCRIPTORS, target) || [];
}