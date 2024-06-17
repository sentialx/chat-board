import { EntityRepository, EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException } from "@nestjs/common";
import { Option } from "~/common/js/option";

import { UserEntity } from "../user/user_entity";

import { CreateRoleProperties, RoleEntity } from "./role_entity";
import { RoleApi } from "~/common/role_api";
import { WorkspaceEntity } from "../workspace/workspace_entity";
import { UserService } from "../user/user_service";

export class RoleService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: EntityRepository<RoleEntity>,
    public readonly em: EntityManager,
  ) {}

  public async create(props: CreateRoleProperties): Promise<RoleEntity> {
    const r = new RoleEntity();
    r.name = props.name;
    r.isPrivileged = props.isPrivileged ?? false;
    r.workspace = props.workspace;
    r.removable = props.removable ?? true;

    await this.em.transactional(async (em) => {
      await em.persistAndFlush([r]);
    });

    return r;
  }

  public async asRoleApi(role: RoleEntity): Promise<RoleApi> {
    const data: RoleApi = {
      isPrivileged: role.isPrivileged,
      name: role.name,
      uuid: role.uuid,
    };
    return data;
  }

  public async fromUuid(uuid: string): Promise<Option<RoleEntity>> {
    const role = await this.roleRepo.findOne({ uuid });
    return new Option(role, { error: new Error("Role not found") });
  }

  public async getUsers(role: RoleEntity): Promise<UserEntity[]> {
    await this.em.populate(role, ["users"]);
    await role.users.loadItems();
    return role.users.getItems();
  }

  public async remove(role: RoleEntity): Promise<void> {
    await this.em.transactional(async (em) => {
      await em.removeAndFlush(role);
    });
  }

  public async checkPermissions(
    user: UserEntity,
    workspace: WorkspaceEntity,
  ): Promise<void> {
    const isUserPrivileged = await this.userService.isPrivilegedInWorkspace(
      user,
      workspace,
    );
    if (!isUserPrivileged) {
      throw new BadRequestException("User is not privileged in this workspace");
    }
  }

  public async checkRolePrivileges(
    user: UserEntity,
    role: RoleEntity,
  ): Promise<void> {
    await this.em.populate(role, ["workspace"]);
    return await this.checkPermissions(user, role.workspace);
  }

  public async list(workspace: WorkspaceEntity): Promise<RoleEntity[]> {
    return this.em.find(RoleEntity, { workspace: { uuid: workspace.uuid } });
  }

  public async getWorkspace(role: RoleEntity): Promise<WorkspaceEntity> {
    await this.em.populate(role, ["workspace"]);
    return role.workspace;
  }
}
