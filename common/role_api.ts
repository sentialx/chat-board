export interface RoleApi {
  uuid: string;
  name: string;
  isPrivileged: boolean;
}

export interface CreateRoleDto {
  name: string;
  isPrivileged?: boolean;
  workspaceUuid: string;
}

export interface CreateRoleResponse {
  uuid: string;
}
