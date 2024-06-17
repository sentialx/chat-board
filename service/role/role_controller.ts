import {
  Controller,
  Body,
  BadRequestException,
  Post,
  UseGuards,
  Get,
  Param,
} from "@nestjs/common";

import { RoleService } from "./role_service";
import { CreateRoleDto, RoleApi } from "~/common/role_api";
import { UserEntity } from "../user/user_entity";
import { UserService } from "../user/user_service";
import { WorkspaceService } from "../workspace/workspace_service";
import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";

@Controller("role")
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post("create")
  @UseGuards(AuthGuard)
  public async create(
    @Body() body: CreateRoleDto,
    @SessionUser() user: UserEntity,
  ): Promise<RoleApi> {
    const workspace = (
      await this.workspaceService.fromUuid(body.workspaceUuid)
    ).unwrap();
    await this.roleService.checkPermissions(user, workspace);

    if (!body.name) {
      throw new BadRequestException("Name is required");
    }

    const role = await this.roleService.create({
      name: body.name,
      isPrivileged: body.isPrivileged,
      workspace,
      removable: true,
    });

    return this.roleService.asRoleApi(role);
  }

  @Post("remove")
  @UseGuards(AuthGuard)
  public async remove(
    @Body() body: { roleUuid: string },
    @SessionUser() user: UserEntity,
  ): Promise<void> {
    const role = (await this.roleService.fromUuid(body.roleUuid)).unwrap();
    await this.roleService.checkPermissions(user, role.workspace);
    await this.roleService.remove(role);
  }

  @Get("list/:workspaceUuid")
  @UseGuards(AuthGuard)
  public async list(
    @SessionUser() user: UserEntity,
    @Param("workspaceUuid") workspaceUuid: string,
  ): Promise<RoleApi[]> {
    const workspace = (
      await this.workspaceService.fromUuid(workspaceUuid)
    ).unwrap();
    const roles = await this.roleService.list(workspace);
    return await Promise.all(roles.map((e) => this.roleService.asRoleApi(e)));
  }

  @Get(":uuid")
  @UseGuards(AuthGuard)
  public async get(
    @Param("uuid") uuid: string,
    @SessionUser() user: UserEntity,
  ): Promise<RoleApi> {
    const role = (await this.roleService.fromUuid(uuid)).unwrap();
    await this.userService.checkIsInWorkspace(
      user,
      await this.roleService.getWorkspace(role),
    );
    return this.roleService.asRoleApi(role);
  }
}
