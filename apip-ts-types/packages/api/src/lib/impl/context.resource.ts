import { IContext } from '../interfaces/context.interface';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class DefaultRequestContext implements IContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private data = new WeakMap<object, Map<string, any>>();

  set<T>(key: string, value: T): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentContext = this.data.get(this) || new Map<string, any>();
    currentContext.set(key, value);
    this.data.set(this, currentContext);
  }

  get<T>(key: string): T | undefined {
    const currentContext = this.data.get(this);
    return currentContext ? currentContext.get(key) : undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}
