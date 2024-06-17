import { AxiosResponse } from "axios";

import { action, computed, makeObservable, observable } from "mobx";
import {
  CreateRoleDto,
  CreateTaskDto,
  CreateWorkspaceDto,
  InviteUserDto,
  RoleApi,
  TaskApi,
  TaskStatus,
  UpdateTaskDto,
  WorkspaceApi,
} from "~/eryk/licencjat/common";

import { ApiClient } from "./api_client";
import { WorkspaceStore } from "./workspace_store";

export class TaskStore {
  public tasks: TaskApi[] = [];

  constructor(
    private workspaceStore: WorkspaceStore,
    private apiClient: ApiClient,
  ) {
    makeObservable(this, {
      tasks: observable,
      fetch: action,
      create: action,
      todoTasks: computed,
      inProgressTasks: computed,
      doneTasks: computed,
    });
  }

  public get todoTasks(): TaskApi[] {
    return this.tasks.filter((t) => t.status === TaskStatus.TODO);
  }

  public get inProgressTasks(): TaskApi[] {
    return this.tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  }

  public get doneTasks(): TaskApi[] {
    return this.tasks.filter((t) => t.status === TaskStatus.DONE);
  }

  public async fetch(): Promise<TaskApi[]> {
    if (!this.workspaceStore.selected) return [];

    const { data: res } = await this.apiClient.client.get<
      any,
      AxiosResponse<TaskApi[]>
    >(`/task/list`, {
      params: {
        workspaceUuid: this.workspaceStore.selected.uuid,
      },
    });

    this.tasks = res;
    return res;
  }

  public async create(taskDto: CreateTaskDto): Promise<void> {
    const { data: res } = await this.apiClient.client.post<
      CreateTaskDto,
      AxiosResponse<TaskApi>
    >(`/task/create`, taskDto);

    this.tasks.push(res);
  }

  public async update(taskDto: UpdateTaskDto): Promise<void> {
    const { data: res } = await this.apiClient.client.post<
      UpdateTaskDto,
      AxiosResponse<TaskApi>
    >(`/task/update`, taskDto);

    const index = this.tasks.findIndex((t) => t.uuid === res.uuid);
    this.tasks[index] = res;
  }
}
