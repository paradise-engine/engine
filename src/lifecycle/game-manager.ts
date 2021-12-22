import { Behaviour, GameObject, Scene } from "../core";
import { LifecycleError, SceneLoadError } from "../errors";
import { ResourceLoader } from "../resource";
import { Time } from "../time";
import { recursiveEvent } from "../util";

export class GameManager {
    private _loader: ResourceLoader;

    private _currentScene?: Scene;
    private _isRunning = false;

    // #region Flags

    private _transitionFlag: Scene | null = null;

    // #endregion

    // #region Caches

    // caches

    // objects that have been enabled since last lifecycle run
    private _enabledObjects: Set<string> = new Set();

    // #endregion

    // #region Getters

    public get loader() {
        return this._loader;
    }

    public get isRunning() {
        return this._isRunning;
    }

    public get currentScene() {
        return this._currentScene;
    }

    public get aboutToTransition() {
        return this._transitionFlag !== null;
    }

    public get nextTransition() {
        return this._transitionFlag;
    }

    // #endregion

    // #region Event Handlers

    private _onSceneObjectEnabled = (id: string) => {
        this._enabledObjects.add(id);
    }
    private _onSceneObjectDisabled = (id: string) => {
        this._enabledObjects.delete(id);
    }

    // #endregion

    constructor(loader: ResourceLoader) {
        this._loader = loader;
    }

    /**
     * Main game loop that runs once per frame
     * @param msElapsed 
     */
    private _gameLoop = (msElapsed: number) => {
        Time.tick(msElapsed);

        if (this._transitionFlag) {
            this._executeTransition();
        }

        const scene = this.currentScene;
        if (!scene) {
            throw new LifecycleError('No scene loaded');
        }

        // TODO handle lifecycle

        // Start cycle
        for (const id of this._enabledObjects) {
            const obj = scene.application.managedObjectRepository.getObjectById(id);
            if (obj) {
                if (obj instanceof GameObject) {
                    recursiveEvent(obj, 'onStart');
                } else if (obj instanceof Behaviour) {
                    obj.onEnable();
                }
            }
        }
        this._enabledObjects.clear();

        // Update cycle
        for (const obj of scene.getAllGameObjects()) {
            recursiveEvent(obj, 'onUpdate');
        }

        requestAnimationFrame(this._gameLoop);
    }

    // #region Private

    private _queueSceneResources(scene: Scene) {
        // TODO add scene resources to load (or unflag them if they are already loaded)
        // first, SpriteRenderer, VideoRenderer, AudioListener etc. need to be implemented
        // also, resource load priority need to be implemented
    }

    private _executeTransition() {
        if (!this._transitionFlag) {
            throw new SceneLoadError('Cannot transition scene: No scene selected for transition');
        }

        this._unloadScene();
        this._loadScene(this._transitionFlag);


        this._queueSceneResources(this._transitionFlag);
        this.loader.purge();
        this.loader.load(() => {
            // TODO emit an event
        });
    }

    private _loadScene(scene: Scene) {
        this._transitionFlag = null;
        this._currentScene = scene;

        for (const { id } of scene.getAllGameObjects()) {
            this._enabledObjects.add(id);
        }

        scene.on('objectEnabled', this._onSceneObjectEnabled);
        scene.on('objectDisabled', this._onSceneObjectDisabled);
    }

    private _unloadScene() {
        this.loader.preparePurge();
        this._currentScene?.off('objectEnabled', this._onSceneObjectEnabled);
        this._currentScene?.off('objectDisabled', this._onSceneObjectDisabled);

        this._currentScene = undefined;
        this._enabledObjects = new Set();
    }

    // #endregion

    // #region Public

    public setLoader(loader: ResourceLoader) {
        this._loader = loader;
    }

    public loadScene(scene: Scene) {
        if (this._currentScene) {
            throw new SceneLoadError('Cannot load scene: A scene is already loaded. Use transitionScene instead');
        }

        this._loadScene(scene);
    }

    public transitionScene(scene: Scene) {
        if (!this._currentScene) {
            throw new SceneLoadError('Cannot transition scene: There is no active scene to transition from. For initial scene load use loadScene');
        }

        this._transitionFlag = scene;
    }

    public unloadScene() {
        if (!this._currentScene) {
            throw new SceneLoadError('Cannot unload scene: There is no active scene to unload');
        }

        if (this._isRunning) {
            throw new SceneLoadError('Cannot unload scene: Game loop is running');
        }

        this._unloadScene();
    }

    public start() {
        if (!this._isRunning) {
            this._isRunning = true;
            requestAnimationFrame(this._gameLoop);
        }
    }

    // #endregion
}