import { Dictionary } from "./dictionary";

export type DictionaryProxyCancelFunction = () => void;
export type DictionaryProxyNotification<T> = (key: string, newValue: T, originalValue: T, cancel: DictionaryProxyCancelFunction) => void;

/**
 * Creates a new Proxy that is wrapped around a Dictionary and that notifies whenever a new value on that Dictionary is set.
 * @param notify The callback that is called __after__ a new value has been set. By calling the `cancel` method that this
 *      callback provides, the assignment of the new value can be undone.
 * @returns The proxified Dictionary object
 */
export function createDictionaryProxy<T>(notify: DictionaryProxyNotification<T>, initial?: Dictionary<T>): Dictionary<T> {
    const dict: Dictionary<T> = initial || {};
    const proxy = new Proxy(dict, {
        'set': function (target, prop: string, value: T) {
            let isCancelled = false;
            const cancel: DictionaryProxyCancelFunction = () => {
                isCancelled = true;
            }

            const hadProp = target.hasOwnProperty(prop);
            const originalValue = target[prop];

            target[prop] = value;

            notify(prop, value, originalValue, cancel);

            if (isCancelled) {
                if (hadProp) {
                    target[prop] = originalValue;
                } else {
                    delete target[prop];
                }
            }

            return true;
        }
    });
    return proxy;
}