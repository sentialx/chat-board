import { computed, makeObservable } from "mobx";
import { enableStaticRendering } from "mobx-react";

import { ApiClient } from "./api_client";
import { ChatStore } from "./chat_store";
import { ConfigStore } from "./config_store";
import { NavigationStore } from "./navigation_store";

import { PopupStore } from "~/common/ui/store/popup_store";

import { Media, TaskApi } from "~/common";
import { WorkspaceStore } from "./workspace_store";
import { SettingsStore } from "./settings_store";
import { TaskStore } from "./task_store";

enableStaticRendering(typeof window === "undefined");

interface EditTaskPopup {
  task?: TaskApi;
}

export class AppStore {
  private static _instance: AppStore;

  public readonly configStore: ConfigStore;
  public readonly chatStore: ChatStore;
  public readonly apiClient: ApiClient;
  public readonly navigationStore: NavigationStore;
  public readonly workspaceStore: WorkspaceStore;
  public readonly settingsStore: SettingsStore;
  public readonly taskStore: TaskStore;

  public mediaPopup = new PopupStore<Media>();
  public newWorkspacePopup = new PopupStore();
  public authPopup = new PopupStore();
  public invitePopup = new PopupStore();
  public settingsPopup = new PopupStore();
  public editTaskPopup = new PopupStore<EditTaskPopup>();

  constructor() {
    makeObservable(this, {});
    this.configStore = new ConfigStore();
    this.apiClient = new ApiClient(this);
    this.chatStore = new ChatStore(this, this.apiClient);
    this.navigationStore = new NavigationStore(
      this,
      this.apiClient,
      this.chatStore,
    );
    this.workspaceStore = new WorkspaceStore(this.apiClient);
    this.settingsStore = new SettingsStore(this.workspaceStore, this.apiClient);
    this.taskStore = new TaskStore(this.workspaceStore, this.apiClient);
  }
}
