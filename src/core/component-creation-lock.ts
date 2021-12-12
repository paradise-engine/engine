import { RuntimeInconsistencyError } from "../errors";

/**
 * INTERNAL ONLY
 * Components should never be instantiated manually.
 * Instead, component instatiation should only be handled
 * by the GameObject class.
 * 
 * This static class is used to unlock component creation.
 * It should not be used by non-internal classes.
 */
export class __ComponentCreationLock {
	private __isLocked = true;

	public unlockComponentCreation() {
		if (this.__isLocked) {
			this.__isLocked = false;
		} else {
			throw new RuntimeInconsistencyError('Tried to unlock already unlocked component creation');
		}
	}

	public lockComponentCreation() {
		if (!this.__isLocked) {
			this.__isLocked = true;
		} else {
			throw new RuntimeInconsistencyError('Tried to lock already locked component creation');
		}
	}

	public componentsMayBeCreated() {
		return !this.__isLocked;
	}
}