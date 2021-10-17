export type Dictionary<T> = { [key: string | number | symbol]: T }
export type StringDictionary<T> = { [key: string]: T }
export type NumberDictionary<T> = { [key: number]: T }
export type SymbolDictionary<T> = { [key: symbol]: T }