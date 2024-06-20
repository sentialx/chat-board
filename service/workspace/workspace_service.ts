import { EntityRepository, EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { validate as isValidUUID } from "uuid";
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

import { CreateWorkspaceProperties, WorkspaceEntity } from "./workspace_entity";
import { UserService } from "../user/user_service";
import { RoleService } from "../role/role_service";
import { Option } from "~/common/js/option";

export class WorkspaceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepo: EntityRepository<WorkspaceEntity>,
    private readonly em: EntityManager,
  ) {}

  public async create(
    props: CreateWorkspaceProperties,
  ): Promise<WorkspaceEntity> {
    const w = new WorkspaceEntity();
    w.name = props.name;
    if (props.icon) {
      (w.icon as any as MediaEntity) = props.icon;
    }
    w.users.add(props.admin);

    await this.em.transactional(async (em) => {
      await em.persistAndFlush([w]);
    });

    const role = await this.roleService.create({
      name: "Admin",
      isPrivileged: true,
      workspace: w,
      removable: false,
    });
    role.users.add(props.admin);

    await this.em.persistAndFlush([role]);

    return w;
  }

  public async asWorkspaceApi(workspace: WorkspaceEntity): Promise<ApiUser> {
    await this.em.populate(workspace, ["icon", "users"]);
    await workspace.users.loadItems();
    const [users, icon] = await Promise.all([
      Promise.all(
        workspace.users.getItems().map((u) => this.userService.asApiUser(u)),
      ),
      this.mediaService.asApiMedia(workspace.icon as any as MediaEntity),
    ]);
    const data: ApiUser = {
      uuid: workspace.uuid,
      name: workspace.name,
      icon,
      users,
    };
    return data;
  }

  public async fromUuid(uuid: string): Promise<Option<WorkspaceEntity>> {
    const w = await this.workspaceRepo.findOne({ uuid });
    return new Option(w, {
      error: new HttpException("Workspace not found", HttpStatus.NOT_FOUND),
    });
  }

  public async changeName(
    workspace: WorkspaceEntity,
    name: string,
  ): Promise<WorkspaceEntity> {
    workspace.name = name;
    await this.em.persistAndFlush(workspace);
    return workspace;
  }

  public async addUser(
    workspace: WorkspaceEntity,
    user: UserEntity,
  ): Promise<WorkspaceEntity> {
    workspace.users.add(user);
    await this.em.persistAndFlush(workspace);
    return workspace;
  }

  public async listForUser(user: UserEntity): Promise<WorkspaceEntity[]> {
    return this.em.find(WorkspaceEntity, { users: { uuid: user.uuid } });
  }
}
