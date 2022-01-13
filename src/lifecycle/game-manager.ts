import { Behaviour, GameObject, recursiveEvent, Renderer } from "../core";
import { LifecycleError, SceneLoadError } from "../errors";
import { IRenderPipeline } from "../graphics";
import { IResourceLoader } from "../resource";
import { Scene } from "../scene";
import { Time } from "../time";

export class GameManager {
    private _loader: IResourceLoader<any>;
    private _renderPipeline: IRenderPipeline;

    private _currentScene?: Scene;
    private _isRunning = false;

    private _debugMode = false;

    // #region Flags

    private _transitionFlag: Scene | null = null;

    // #endregion

    // #region Caches

    // caches

    // objects that have been enabled since last lifecycle run
    private _enabledObjects: Set<string> = new Set();

    // objects that have been awakened already
    private _awakenedObjects: Set<string> = new Set();

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
    private _onSceneObjectAwakened = (id: string) => {
        this._awakenedObjects.add(id);
    }

    // #endregion

    constructor(loader: IResourceLoader<any>, pipeline: IRenderPipeline, debugMode?: boolean) {
        this._loader = loader;
        this._renderPipeline = pipeline;
        this._debugMode = debugMode || false;
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

        // Start phase
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

        // Update phase
        for (const obj of scene.getAllGameObjects()) {
            recursiveEvent(obj, 'onUpdate');
        }

        // Draw phase
        for (const camera of scene.getAllCameras()) {
            const cullingResults = camera.performCulling();
            for (const res of cullingResults) {
                const renderer = res.getComponent(Renderer);
                if (renderer) {
                    const primitive = renderer.getPrimitive();
                    primitive.render(this._renderPipeline);
                }
            }
            this._renderPipeline.drawFrame();
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

        for (const obj of scene.getAllGameObjects()) {
            recursiveEvent(obj, 'onAwake', {
                onCall: (obj) => {
                    this._awakenedObjects.add(obj.id);
                }
            });
            this._enabledObjects.add(obj.id);
        }

        scene.on('objectEnabled', this._onSceneObjectEnabled);
        scene.on('objectDisabled', this._onSceneObjectDisabled);
        scene.on('objectAwakened', this._onSceneObjectAwakened);
    }

    private _unloadScene() {
        this.loader.preparePurge();
        this._currentScene?.off('objectEnabled', this._onSceneObjectEnabled);
        this._currentScene?.off('objectDisabled', this._onSceneObjectDisabled);
        this._currentScene?.off('objectAwakened', this._onSceneObjectAwakened);

        for (const gameObject of this._currentScene?.getAllGameObjects() || []) {
            if (!gameObject.isDestroyed) {
                gameObject.destroy();
            }
        }

        this._currentScene = undefined;
        this._enabledObjects = new Set();
        this._awakenedObjects = new Set();


    }

    // #endregion

    // #region Public

    public setLoader(loader: IResourceLoader<any>) {
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
            console.log('################################');
            console.log('################################');
            console.log('################################');
            console.log('STARTING GAME LOOP!!');
            console.log('################################');
            console.log('################################');
            console.log('################################');
            this._isRunning = true;
            requestAnimationFrame(this._gameLoop);
        }
    }

    public setRenderPipeline(p: IRenderPipeline) {
        this._renderPipeline = p;
    }

    // #endregion
}