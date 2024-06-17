import { EntityRepository, EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { randomString } from "~/common/js/random";

import {
  Me as ApiMe,
  User as ApiUser,
  UserPost as ApiUserPost,
} from "~/common/user";
import { AuthUserEntity } from "../auth/auth_user_entity";
import { ConfigService } from "../config_service";
import { MediaEntity } from "../media/media_entity";
import { MediaService } from "../media/media_service";
import { UserEntity } from "../user/user_entity";

import { WorkspaceEntity } from "../workspace/workspace_entity";
import { Option } from "~/common/js/option";
import { RoleEntity } from "../role/role_entity";

export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
    @InjectRepository(UserEntity)
    private readonly usersRepo: EntityRepository<UserEntity>,
    private readonly em: EntityManager,
  ) {}

  public async create(
    authUser: AuthUserEntity,
    {
      timeZone,
      fullName,
    }: {
      timeZone?: string;
      fullName: string;
    },
  ): Promise<UserEntity> {
    const user = new UserEntity();
    user.displayName = fullName;
    user.timeZone = timeZone;
    return user;
  }

  public async findUserByAuthId(
    authId: string,
  ): Promise<UserEntity | undefined> {
    const user = await this.usersRepo.findOne({ authUsers: { uuid: authId } });
    return user || undefined;
  }

  public async asApiUser(user: UserEntity): Promise<ApiUser> {
    await this.em.populate(user, ["avatar"]);
    const avatar = await this.mediaService.asApiMedia(
      user.avatar as any as MediaEntity,
    );
    const data: ApiUser = {
      uuid: user.uuid,
      displayName: user.displayName,
      avatar,
    };
    return data;
  }

  public async asApiMe(user: UserEntity): Promise<ApiMe> {
    const base = await this.asApiUser(user);
    return {
      ...base,
    };
  }

  public async fromUuid(uuid: string): Promise<Option<UserEntity>> {
    const user = await this.usersRepo.findOne({ uuid });
    return new Option(user, {
      error: new HttpException("User not found", HttpStatus.NOT_FOUND),
    });
  }

  public async query(query: Partial<UserEntity>): Promise<UserEntity[]> {
    return this.usersRepo.find(query);
  }

  public async fromEmail(email: string): Promise<Option<UserEntity>> {
    const user = await this.usersRepo.findOne({ authUsers: { email } });
    return new Option(user, {
      error: new HttpException("User not found", HttpStatus.NOT_FOUND),
    });
  }

  public async changeDisplayName(
    user: UserEntity,
    displayName: string,
  ): Promise<UserEntity> {
    user.displayName = displayName;
    await this.em.persistAndFlush(user);
    return user;
  }

  public async getWorkspaces(user: UserEntity): Promise<WorkspaceEntity[]> {
    return this.em.find(WorkspaceEntity, { users: { uuid: user.uuid } });
  }

  public async getRolesInWorkspace(
    user: UserEntity,
    workspace: WorkspaceEntity,
  ): Promise<RoleEntity[]> {
    await this.checkIsInWorkspace(user, workspace);

    const roles = await this.em.find(RoleEntity, {
      workspace: { uuid: workspace.uuid },
      users: { uuid: user.uuid },
    });
    return roles;
  }

  public async hasRole(user: UserEntity, role: RoleEntity): Promise<boolean> {
    await this.em.populate(role, ["users"]);
    return role.users.contains(user);
  }

  public async assignRole(user: UserEntity, role: RoleEntity): Promise<void> {
    await this.em.populate(role, ["workspace"]);

    await this.checkIsInWorkspace(user, role.workspace);

    role.users.add(user);
    await this.em.persistAndFlush(role);
  }

  public async unassignRole(user: UserEntity, role: RoleEntity): Promise<void> {
    await this.em.populate(role, ["workspace"]);

    await this.checkIsInWorkspace(user, role.workspace);

    await this.em.populate(role, ["users"]);

    if (!role.users.contains(user)) {
      throw new BadRequestException("User didn't have this role");
    }

    if (role.isPrivileged) {
      // Check if there are any other privileged roles
      const otherRoles = await this.em.find(RoleEntity, {
        workspace: { uuid: role.workspace.uuid },
        users: { uuid: user.uuid },
        isPrivileged: true,
      });

      await Promise.all(otherRoles.map((r) => this.em.populate(r, ["users"])));

      if (otherRoles.length === 1) {
        throw new BadRequestException("Cannot remove last privileged role");
      }

      // count users with privileged roles
      const count = await this.em.count(RoleEntity, {
        workspace: { uuid: role.workspace.uuid },
        isPrivileged: true,
        users: { uuid: user.uuid },
      });

      if (count === 1) {
        throw new BadRequestException(
          "Cannot unassign last privileged role from user",
        );
      }
    }

    role.users.remove(user);
    await this.em.persistAndFlush(role);
  }

  public async isInWorkspace(
    user: UserEntity,
    workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.em.populate(workspace, ["users"]);
    return workspace.users.contains(user);
  }

  public async checkIsInWorkspace(
    user: UserEntity,
    workspace: WorkspaceEntity | undefined,
  ): Promise<void> {
    if (!workspace) {
      throw new BadRequestException("Invalid workspace");
    }
    if (!(await this.isInWorkspace(user, workspace))) {
      throw new BadRequestException("User is not in workspace");
    }
  }

  public async isPrivilegedInWorkspace(
    user: UserEntity,
    workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.checkIsInWorkspace(user, workspace);

    const userRoles = await this.getRolesInWorkspace(user, workspace);
    return userRoles.some((r) => r.isPrivileged);
  }
}
