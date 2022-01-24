import { Camera, GameObject, ManagedObjectRepository } from "./core";
import { IRenderPipeline, WebGLRenderPipeline } from "./graphics";
import { ApplicationInitializedError, ApplicationNotInitializedError } from "./errors";
import { __ComponentCreationLock } from "./core/component-creation-lock";
import { GameManager } from "./lifecycle";
import { IResourceLoader, ResourceLoader } from "./resource";
import { deserialize } from "./serialization";
import { IInputManager, InputManager } from "./input";
import { CommonGizmos, createCommonGizmos } from "./editor";
import { editor_camera_obj } from "./editor/_editor-camera";

export interface ApplicationEditorModeOptions { }

export interface ApplicationOptions {
    id?: string;
    renderPipeline?: IRenderPipeline;
    loader?: IResourceLoader;
    gameManager?: GameManager;
    inputManager?: IInputManager;
    debugMode?: boolean;
    editorMode?: ApplicationEditorModeOptions;
}

export class Application {
    private static _app: Application;

    public static initializeApplication(options: ApplicationOptions) {
        if (this._app) {
            throw new ApplicationInitializedError();
        }

        const app = new Application(options);
        this._app = app;

        app._createCommonGizmos();

        return app;
    }

    public static get instance() {
        if (!this._app) {
            throw new ApplicationNotInitializedError();
        }

        return this._app;
    }

    private _loader: IResourceLoader;
    private _gameManager: GameManager;
    private _managedObjectRepository: ManagedObjectRepository;
    private _renderPipeline: IRenderPipeline;
    private _inputManager: IInputManager;
    private _editorMode?: boolean = false;
    private _commonGizmos?: CommonGizmos;
    private _editorCamera?: GameObject;

    public get loader() {
        return this._loader;
    }

    public get gameManager() {
        return this._gameManager;
    }

    public get managedObjectRepository() {
        return this._managedObjectRepository;
    }

    public get renderPipeline() {
        return this._renderPipeline;
    }

    public get inputManager() {
        return this._inputManager;
    }

    public get editorMode() {
        return this._editorMode;
    }

    public get commonGizmos() {
        return this._commonGizmos;
    }

    private constructor(options: ApplicationOptions = {}) {

        if (options.editorMode) {
            this._editorMode = true;
        }

        this._managedObjectRepository = new ManagedObjectRepository();
        this._renderPipeline = options.renderPipeline || new WebGLRenderPipeline({
            ...(options.renderPipeline || {}),
            debugMode: options.debugMode
        });
        this._loader = options.loader || new ResourceLoader(this.renderPipeline as WebGLRenderPipeline);
        this._gameManager = new GameManager(this._loader, this._renderPipeline, undefined, options.debugMode);
        this._inputManager = options.inputManager || new InputManager();
    }

    private _createCommonGizmos() {
        if (this.editorMode) {
            this._loader.ready(() => {
                this._commonGizmos = createCommonGizmos();
                this._editorCamera = deserialize(editor_camera_obj);
                const camComp = this._editorCamera.getComponent(Camera);
                if (camComp) {
                    this._gameManager.setEditorCamera(camComp);
                }
            });
        }
    }

    public setRenderPipeline(pipeline: IRenderPipeline) {
        this._renderPipeline = pipeline;
        this._loader.setRenderPipeline(pipeline);
        this._gameManager.setRenderPipeline(pipeline);
    }

    public setLoader(loader: ResourceLoader) {
        this._loader = loader;
        this._gameManager.setLoader(loader);
    }

    public setGameManager(gm: GameManager) {
        this._gameManager = gm;
    }

    public setInputManager(im: InputManager) {
        this._inputManager = im;
    }
}
