import { SingletonConstraintViolationError } from "../errors";

export class TimeSingleton {
    private static __created = false;

    private _totalMsElapsed = 0;
    private _msSinceLastTick = 0;

    public get timeDeltaSeconds() {
        return this._msSinceLastTick / 1000;
    }

    public get timeDeltaMs() {
        return this._msSinceLastTick;
    }

    constructor() {
        if (TimeSingleton.__created === true) {
            throw new SingletonConstraintViolationError(TimeSingleton.name);
        }
        TimeSingleton.__created = true;
    }

    public tick(ms: number) {
        this._totalMsElapsed += ms;
        this._msSinceLastTick = ms;
    }
}

export const Time = new TimeSingleton();