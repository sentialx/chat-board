import { Media } from "./media";
import { ApiUser } from "./user";

export interface WorkspaceApi {
  uuid: string;
  name: string;
  users: ApiUser[];
  createdAt: Date;
  icon?: Media;
}

export interface CreateWorkspaceDto {
  name: string;
  iconUuid?: string;
}

export interface InviteUserDto {
  workspaceUuid: string;
  email: string;
}

export interface CreateWorkspaceResponse {
  workspaceUuid: string;
}
