import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Session,
  UseGuards,
} from "@nestjs/common";

import { GetUserResponse } from "../../common";

import { UserService } from "./user_service";
import { AuthGuard } from "../auth/auth_guard";
import { SessionUser } from "../auth/auth_decorators";
import { UserEntity } from "./user_entity";
import { WorkspaceService } from "../workspace/workspace_service";
import { RoleService } from "../role/role_service";

@Controller("users")
export class UserApiController {
  constructor(
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly roleService: RoleService,
  ) {}

  @Get(":uuid")
  public async getUser(@Param("uuid") uuid: string): Promise<GetUserResponse> {
    const user = (await this.userService.fromUuid(uuid)).unwrap();
    return this.userService.asApiUser(user);
  }

  @Get("roles")
  @UseGuards(AuthGuard)
  public async getRoles(
    @Query() query: { userUuid: string; workspaceUuid: string },
    @SessionUser() user: UserEntity,
  ): Promise<GetUserResponse> {
    const workspace = (
      await this.workspaceService.fromUuid(query.workspaceUuid)
    ).unwrap();

    await this.userService.checkIsInWorkspace(user, workspace);

    const targetUser = (
      await this.userService.fromUuid(query.userUuid)
    ).unwrap();
    await this.userService.checkIsInWorkspace(targetUser, workspace);

    const roles = await this.userService.getRolesInWorkspace(
      targetUser,
      workspace,
    );

    return await Promise.all(roles.map((e) => this.roleService.asRoleApi(e)));
  }

  @Post("role/toggle")
  @UseGuards(AuthGuard)
  public async assignRole(
    @Body() body: { userUuid: string; roleUuid: string },
    @SessionUser() user: UserEntity,
  ): Promise<void> {
    const role = (await this.roleService.fromUuid(body.roleUuid)).unwrap();
    const targetUser = (
      await this.userService.fromUuid(body.userUuid)
    ).unwrap();

    await this.roleService.em.populate(role, ["workspace"]);

    await this.roleService.checkPermissions(user, role.workspace);

    if (await this.userService.hasRole(targetUser, role)) {
      await this.userService.unassignRole(targetUser, role);
    } else {
      await this.userService.assignRole(targetUser, role);
    }
  }
}
