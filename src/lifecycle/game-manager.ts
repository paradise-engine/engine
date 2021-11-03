import { Scene } from "../core";
import { SceneLoadError } from "../errors";
import { Renderer } from "../renderer";
import { Time } from "../time";

export class GameManager {
    private _currentScene?: Scene;
    private _isRunning = false;

    private _pauseFlag = false;
    private _transitionFlag = false;
    private _transitionScene?: Scene;

    public readonly renderer: Renderer;

    public get isRunning() {
        return this._isRunning;
    }

    public get currentScene() {
        return this._currentScene;
    }

    public get aboutToPause() {
        return this._pauseFlag;
    }

    public get aboutToTransition() {
        return this._transitionFlag;
    }

    public get nextTransition() {
        return this._transitionScene;
    }

    constructor() {
        this.renderer = new Renderer();
    }

    private _gameLoop = (msElapsed: number) => {
        Time.tick(msElapsed);

        if (this._transitionFlag) {
            this._executeTransition();
        }

        // TODO handle lifecycle

        if (!this._pauseFlag) {
            requestAnimationFrame(this._gameLoop);
        }
    }

    private _executeTransition() {
        this._currentScene = this._transitionScene;
        this._transitionFlag = false;
    }

    public loadScene(scene: Scene) {
        if (this._currentScene) {
            throw new SceneLoadError('Cannot load scene: A scene is already loaded. Use transitionScene instead');
        }

        this._currentScene = scene;
    }

    public transitionScene(scene: Scene) {
        if (!this._currentScene) {
            throw new SceneLoadError('Cannot transition scene: There is no active scene to transition from. For initial scene load use loadScene');
        }

        this._transitionFlag = true;
        this._transitionScene = scene;
    }

    public unloadScene() {
        if (!this._currentScene) {
            throw new SceneLoadError('Cannot unload scene: There is no active scene to unload');
        }

        if (this._isRunning) {
            throw new SceneLoadError('Cannot unload scene: Game loop is running');
        }

        this._currentScene = undefined;
    }

    public start() {
        if (!this._isRunning) {
            requestAnimationFrame(this._gameLoop);
        }
        this._pauseFlag = false;
    }

    public pause() {
        if (this._isRunning && !this._pauseFlag) {
            this._pauseFlag = true;
        }
    }
}