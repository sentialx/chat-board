import { action, makeObservable, observable } from "mobx";

import { VisibilityController } from "../types/visibility_controller";

import { EventEmitter, EventRegistry } from "~/common/js/events";

export interface PopupStoreToggleEvent {
  visible: boolean;
  popup: PopupStore;
}

export type PopupStoreEvents = {
  toggle: (e: PopupStoreToggleEvent) => void;
};

export class PopupStore<T = never>
  extends EventRegistry<PopupStoreEvents>
  implements VisibilityController
{
  protected emitter = new EventEmitter<PopupStoreEvents>(this);

  public data: T | undefined = undefined;

  public visible = false;

  constructor() {
    super();
    makeObservable(this, {
      visible: observable,
      data: observable,
      setVisible: action,
      open: action,
    });
  }

  public setVisible = (visible: boolean): void => {
    this.visible = visible;
  };

  public open(data?: T): void {
    this.data = data;
    this.setVisible(true);
    this.emitter.emit("toggle", { visible: true, popup: this as any });
  }

  public close(): void {
    this.setVisible(false);
    this.emitter.emit("toggle", { visible: false, popup: this as any });
  }

  public toggle(data?: T): void {
    if (this.visible) {
      this.close();
    } else {
      this.open(data);
    }
  }
}
