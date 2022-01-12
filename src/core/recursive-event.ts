import { Behaviour } from "./behaviour";
import { GameObject } from "./game-object";
import { IBehaviour } from "./i-behaviour";
import { ManagedObject } from "./managed-object";

export interface RecursiveEventOptions {
    raiseOnInactive?: boolean;
    onCall?: (object: ManagedObject) => void;
}

export function recursiveEvent(obj: GameObject, event: keyof IBehaviour, options: RecursiveEventOptions = {}) {
    if (options.raiseOnInactive || (obj.isActive && !obj.isDestroyed)) {
        const behaviours = obj.getComponents(Behaviour);
        for (const behaviour of behaviours) {
            if (options.raiseOnInactive || (behaviour.isActive && !behaviour.isDestroyed)) {
                behaviour[event]();
                if (options.onCall) {
                    options.onCall(behaviour);
                }
            }
        }

        const children = obj.getChildren();
        for (const child of children) {
            recursiveEvent(child, event, options);
        }
    }
}