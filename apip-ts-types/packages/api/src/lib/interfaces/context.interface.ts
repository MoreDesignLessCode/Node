export interface IContext{
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
}
