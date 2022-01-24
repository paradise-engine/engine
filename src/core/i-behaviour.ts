export interface IBehaviour {
    onAwake(): void;
    onEnable(): void;
    onStart(): void;
    onUpdate(): void;
    onDestroy(): void;
    onDisable(): void;
}