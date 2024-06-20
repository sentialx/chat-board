import { AxiosResponse } from "axios";

import { action, computed, makeObservable, observable } from "mobx";
import {
  CreateRoleDto,
  CreateWorkspaceDto,
  InviteUserDto,
  RoleApi,
  WorkspaceApi,
} from "~/common";
import { ApiClient } from "./api_client";
import { WorkspaceStore } from "./workspace_store";

export class SettingsStore {
  public roles: RoleApi[] = [];

  constructor(
    private workspaceStore: WorkspaceStore,
    private apiClient: ApiClient,
  ) {
    makeObservable(this, {
      roles: observable,
      listRoles: action,
    });
  }

  public async listRoles(): Promise<RoleApi[]> {
    if (!this.workspaceStore.selected) return [];

    const { data: res } = await this.apiClient.client.get<RoleApi[]>(
      `/role/list/${this.workspaceStore.selected.uuid}`,
    );

    this.roles = res;
    return res;
  }

  public async createRole(name: string): Promise<void> {
    if (!this.workspaceStore.selected) return;
    const { data: res } = await this.apiClient.client.post<CreateRoleDto, any>(
      `/role/create`,
      {
        name,
        workspaceUuid: this.workspaceStore.selected.uuid,
      } as CreateRoleDto,
    );

    this.roles.push(res);
  }

  public async fetchRole(roleUuid: string): Promise<RoleApi> {
    const { data: res } = await this.apiClient.client.get<RoleApi>(
      `/role/${roleUuid}`,
    );

    return res;
  }
}
