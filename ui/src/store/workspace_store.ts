import { AxiosResponse } from "axios";

import { action, computed, makeObservable, observable } from "mobx";
import {
  CreateWorkspaceDto,
  InviteUserDto,
  RoleApi,
  WorkspaceApi,
} from "~/common";
import { ApiClient } from "./api_client";

export class WorkspaceStore {
  public workspaces: WorkspaceApi[] = [];

  public _selected?: string = undefined;

  constructor(private apiClient: ApiClient) {
    makeObservable(this, {
      workspaces: observable,
      _selected: observable,
      selected: computed,
      fetch: action,
      select: action,
    });
  }

  public get selected(): WorkspaceApi | undefined {
    return this.workspaces.find((w) => w.uuid === this._selected);
  }

  public async amIAdmin(): Promise<boolean> {
    if (!this._selected) {
      return false;
    }

    const res = await this.apiClient.client.get<boolean>(
      `/workspace/am-i-admin/${this._selected}`,
    );

    return res.data;
  }

  public async fetch(): Promise<WorkspaceApi[]> {
    const { data: res } = await this.apiClient.client.get<WorkspaceApi[]>(
      `/workspace/list`,
    );

    this.workspaces = res;
    return res;
  }

  public async create(dto: CreateWorkspaceDto): Promise<WorkspaceApi> {
    const { data: res } = await this.apiClient.client.post<WorkspaceApi>(
      `/workspace/create`,
      dto,
    );

    this.workspaces.push(res);
    return res;
  }

  public async toggleRole(userId: string, roleId: string): Promise<void> {
    if (!this._selected) return;

    await this.apiClient.client.post<void>(`/users/role/toggle`, {
      userUuid: userId,
      roleUuid: roleId,
    });
  }

  public async getRoles(userId: string): Promise<RoleApi[]> {
    if (!this._selected) return [];

    const { data: res } = await this.apiClient.client.get<
      WorkspaceApi,
      AxiosResponse<RoleApi[]>
    >(`/users/roles`, {
      params: {
        userUuid: userId,
        workspaceUuid: this._selected,
      },
    });

    return res;
  }

  public async addUser(email: string): Promise<void> {
    await this.apiClient.client.post<InviteUserDto, void>(`/workspace/invite`, {
      email,
      workspaceUuid: this._selected,
    });

    await this.fetch();
  }

  public select(uuid: string): void {
    this._selected = uuid;
  }
}
