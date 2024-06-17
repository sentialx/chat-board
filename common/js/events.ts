export interface EventEmitterBase<T extends EventMap> {
  emit<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): ReturnType<T[K]>[];
  emitAsync<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>>[]>;
}

export class EventEmitter<T extends EventMap> implements EventEmitterBase<T> {
  constructor(protected readonly eventRegistry: EventRegistry<T>) {}

  public emit<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): ReturnType<T[K]>[] {
    return this.eventRegistry
      .getListeners(key)
      .map((listener) => listener(...args));
  }

  public emitAsync<K extends keyof T>(
    key: K,
    ...args: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>>[]> {
    return Promise.all(
      this.eventRegistry.getListeners(key).map((listener) => listener(...args)),
    );
  }
}

interface CommonEventRegistryBase<T extends EventMap> {
  on<K extends keyof T, L extends T[K]>(event: K, listener: L): void;
  once<K extends keyof T, L extends T[K]>(event: K, listener: L): void;
  off<K extends keyof T, L extends T[K]>(event: K, listener: L): void;
}

export interface NodeEventRegistryBase<T extends EventMap> {
  addEventListener<K extends keyof T, L extends T[K]>(
    key: K,
    listener: L,
  ): void;
  removeEventListener<K extends keyof T, L extends T[K]>(
    key: K,
    listener: L,
  ): void;
}

export interface EventRegistryBase<T extends EventMap>
  extends CommonEventRegistryBase<T> {
  getListeners<K extends keyof T>(key: K): T[keyof T][];
  addListener<K extends keyof T, L extends T[K]>(key: K, listener: L): void;
  removeListener<K extends keyof T, L extends T[K]>(key: K, listener: L): void;
}

export type EventMap = Record<string | symbol, (...args: any[]) => any>;

export class EventRegistry<T extends EventMap> implements EventRegistryBase<T> {
  protected readonly listeners = new Map<keyof T, Set<T[keyof T]>>();

  public addListener<K extends keyof T, L extends T[K]>(
    key: K,
    listener: L,
  ): void {
    const set = this.listeners.get(key) ?? new Set();
    this.listeners.set(key, set.add(listener));
  }

  public removeListener<K extends keyof T, L extends T[K]>(
    key: K,
    listener: L,
  ): void {
    const set = this.listeners.get(key);
    if (set != null) {
      set.delete(listener);
    }
  }

  public getListeners<K extends keyof T>(key: K): T[keyof T][] {
    return [...(this.listeners.get(key)?.entries() ?? [])].map(
      ([listener]) => listener,
    );
  }

  public on<K extends keyof T, L extends T[K]>(event: K, listener: L): void {
    this.addListener(event, listener);
  }

  public once<K extends keyof T, L extends T[K]>(event: K, listener: L): void {
    const onceListener = (...args: any[]): void => {
      this.removeListener(event, onceListener as any);
      listener(...args);
    };

    this.addListener(event, onceListener as any);
  }

  public off<K extends keyof T, L extends T[K]>(event: K, listener: L): void {
    this.removeListener(event, listener);
  }
}
