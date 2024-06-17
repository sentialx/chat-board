import {
  Controller,
  Body,
  Get,
  Param,
  NotFoundException,
  Post,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";

import {
  GetUserPostsRequest,
  GetUserPostsResponse,
  GetUserRequest,
  GetUserResponse,
} from "../../common";
import {
  CreateWorkspaceDto,
  InviteUserDto,
  WorkspaceApi,
} from "../../common/workspace_api";
import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";
import { MediaEntity } from "../media/media_entity";
import { MediaService } from "../media/media_service";
import { UserEntity } from "../user/user_entity";
import { UserService } from "../user/user_service";

import { WorkspaceService } from "./workspace_service";
import { RoleService } from "../role/role_service";

@Controller("workspace")
export class WorkspaceController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    private readonly workspaceService: WorkspaceService,
    private readonly roleService: RoleService,
  ) {}

  @Post("create")
  @UseGuards(AuthGuard)
  public async create(
    @Body() body: CreateWorkspaceDto,
    @SessionUser() user: UserEntity,
  ): Promise<GetUserResponse> {
    if (!body.name) {
      throw new BadRequestException("Name is required");
    }

    let icon: MediaEntity | undefined;

    if (body.iconUuid) {
      icon = (await this.mediaService.fromUuid(body.iconUuid)).unwrap();
    }

    const workspace = await this.workspaceService.create({
      admin: user,
      name: body.name,
      icon,
    });

    return this.workspaceService.asWorkspaceApi(workspace);
  }

  @Get("list")
  @UseGuards(AuthGuard)
  public async list(@SessionUser() user: UserEntity): Promise<WorkspaceApi[]> {
    return await Promise.all(
      (
        await this.workspaceService.listForUser(user)
      ).map((x) => this.workspaceService.asWorkspaceApi(x)),
    );
  }

  @Post("invite")
  @UseGuards(AuthGuard)
  public async invite(
    @Body() body: InviteUserDto,
    @SessionUser() user: UserEntity,
  ): Promise<void> {
    const workspace = (
      await this.workspaceService.fromUuid(body.workspaceUuid)
    ).unwrap();

    await this.roleService.checkPermissions(user, workspace);

    const targetUser = (await this.userService.fromEmail(body.email)).unwrap();

    if (await this.userService.isInWorkspace(targetUser, workspace)) {
      throw new BadRequestException("User is already in workspace");
    }
    await this.workspaceService.addUser(workspace, targetUser);
  }

  @Get("am-i-admin/:workspaceUuid")
  @UseGuards(AuthGuard)
  public async amIAdmin(
    @Param("workspaceUuid") workspaceUuid: string,
    @SessionUser() user: UserEntity,
  ): Promise<boolean> {
    const workspace = (
      await this.workspaceService.fromUuid(workspaceUuid)
    ).unwrap();

    return this.userService.isPrivilegedInWorkspace(user, workspace);
  }
}
