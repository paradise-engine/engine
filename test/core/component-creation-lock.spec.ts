import { RuntimeInconsistencyError } from '../../src';
import { __ComponentCreationLock } from '../../src/core/component-creation-lock';


/**
 * `__ComponentCreationLock` is an internal module that is not supposed to be used
 * by external code. In case it does, there are supposed to be some basic checks that throw
 * if the external code is about to run into an inconsistent state. This test verifies that
 * these checks/safeguards are actually performed.
 * External code is still able to deliberately circumvent the safeguards created by this lock and run
 * into inconsistent state.
 */
describe('Internal __ComponentCreationLock', () => {
    it('cannot be unlocked while already unlocked and it cannot be locked while already locked', () => {
        __ComponentCreationLock.unlockComponentCreation();
        expect(() => __ComponentCreationLock.unlockComponentCreation()).toThrow(RuntimeInconsistencyError);
        __ComponentCreationLock.lockComponentCreation();
        expect(() => __ComponentCreationLock.lockComponentCreation()).toThrow(RuntimeInconsistencyError);
    });
});