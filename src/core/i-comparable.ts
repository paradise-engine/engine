/**
 * Interface for objects that can be compared
 * for equality.
 */
export interface IComparable {
    equals(compare: this): boolean;
}