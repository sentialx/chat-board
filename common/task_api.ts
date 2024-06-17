export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface TaskApi {
  uuid: string;
  title: string;
  description: string;
  createdAt: Date;
  assigneeUuid?: string;
  status: TaskStatus;
  roleUuid: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeUuid?: string;
  roleUuid?: string;
  uuid: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskStatus;
  assigneeUuid?: string;
  roleUuid: string;
}

export interface ListTasksRequest {
  workspaceUuid?: string;
  roleUuid?: string;
}