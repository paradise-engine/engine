import { generateRandomString } from "./util";
import { ManagedObjectRepository } from "./core";
import { IRenderer, Renderer } from "./renderer";
import { RuntimeInconsistencyError } from "./errors";
import { __ComponentCreationLock } from "./core/component-creation-lock";
import { GameManager } from "./lifecycle";
import { ResourceLoader } from "./resource";

export interface ApplicationOptions {
    id?: string;
    renderer?: IRenderer;
}

export class Application {
    private static _apps: Map<string, Application> = new Map();

    public static getById(id: string) {
        const app = this._apps.get(id);
        if (!app) {
            throw new RuntimeInconsistencyError(`No application with ID '${id}' registered.`);
        }
        return app;
    }

    private _id: string;
    private __ccLock: __ComponentCreationLock;
    private _loader: ResourceLoader;
    private _gameManager: GameManager;

    public readonly managedObjectRepository: ManagedObjectRepository;
    public readonly renderer: IRenderer;

    public get loader() {
        return this._loader;
    }

    public get gameManager() {
        return this._gameManager;
    }

    public get id() {
        return this._id;
    }

    constructor(options: ApplicationOptions = {}) {
        this._id = options.id || generateRandomString();
        this.__ccLock = new __ComponentCreationLock();
        this.managedObjectRepository = new ManagedObjectRepository();
        this.renderer = options.renderer || new Renderer(options.renderer);

        if ((this.renderer as Renderer).context) {
            this._loader = new ResourceLoader(this.renderer as Renderer);
            this._gameManager = new GameManager(this.renderer, this._loader);
        } else {
            this._loader = undefined as any;
            this._gameManager = undefined as any;
        }

    }
}