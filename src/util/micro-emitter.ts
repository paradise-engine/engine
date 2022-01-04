import { MicroEmitterDuplicateListenerError } from "../errors";
import { Dictionary } from "./dictionary";

export type MicroListener<C, T = any> = (this: C, data: T) => void;

enum ListenerType {
    normal = 1,
    single = 2
}

export interface IEmitter<T extends Dictionary<any>> {
    on<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>): void;
    once<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>): void;
    off<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>): void;
    emit<K extends keyof T>(event: K, ...data: T[K] extends undefined ? [undefined?] : [T[K]]): void;
}

export class MicroEmitter<T extends Dictionary<any>> implements IEmitter<T> {

    private _listeners: Dictionary<Map<MicroListener<this>, ListenerType>> = {}

    private _addEventListener<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>, type: ListenerType) {
        const key = event as string;
        let listenerMap = this._listeners[key];
        if (!listenerMap) {
            listenerMap = new Map();
            this._listeners[key] = listenerMap;
        }

        const existing = listenerMap.get(listener);

        if (existing === undefined) {
            listenerMap.set(listener, type);
        } else if (existing !== type) {
            throw new MicroEmitterDuplicateListenerError(type === ListenerType.normal ? 'on' : 'once');
        }
    }

    private _removeEventListener<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>) {
        const listenerMap = this._listeners[event as string];
        if (listenerMap) {
            listenerMap.delete(listener);
        }
    }

    public on<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>): void {
        this._addEventListener(event, listener, ListenerType.normal);
    }

    public once<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>): void {
        this._addEventListener(event, listener, ListenerType.single);
    }

    public off<K extends keyof T>(event: K, listener: MicroListener<this, T[K]>): void {
        this._removeEventListener(event, listener);
    }

    public emit<K extends keyof T>(
        event: K,
        ...data: T[K] extends undefined ? [undefined?] : [T[K]]
    ) {
        const listenerMap = this._listeners[event as string];

        if (listenerMap) {
            const flaggedForRemoval: MicroListener<this>[] = [];

            listenerMap.forEach((type, fn) => {
                if (type === ListenerType.single) {
                    flaggedForRemoval.push(fn);
                }

                fn.call(this, data[0]);
            });

            for (const listener of flaggedForRemoval) {
                listenerMap.delete(listener);
            }


        }
    }

}
