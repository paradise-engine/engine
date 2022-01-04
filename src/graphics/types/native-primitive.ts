export type NativePrimitive<T> = T extends string ? string extends T ? never : { [K in T]: any } : never;
