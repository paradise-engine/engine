import { Scene } from "../core";
import { SceneLoadError } from "../errors";
import { ResourceLoader } from "../resource";
import { Time } from "../time";

export class GameManager {
    private _currentScene?: Scene;
    private _isRunning = false;

    private _pauseFlag = false;
    private _transitionFlag = false;
    private _transitionScene?: Scene;

    public readonly loader: ResourceLoader;

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

    constructor(loader: ResourceLoader) {
        this.loader = loader;
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

    private _queueSceneResources(scene: Scene) {
        // TODO add scene resources to load (or unflag them if they are already loaded)
        // first, SpriteRenderer, VideoRenderer, AudioListener etc. need to be implemented
        // also, resource load priority need to be implemented
    }

    private _executeTransition() {
        if (!this._transitionScene) {
            throw new SceneLoadError('Cannot transition scene: No scene selected for transition');
        }

        this._transitionFlag = false;
        this._currentScene = this._transitionScene;

        this.loader.preparePurge();
        this._queueSceneResources(this._transitionScene);
        this.loader.purge();
        this.loader.load(() => {
            // TODO emit an event
        });
    }

    public loadScene(scene: Scene) {
        if (this._currentScene) {
            throw new SceneLoadError('Cannot load scene: A scene is already loaded. Use transitionScene instead');
        }

        // TODO

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

        // TODO

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