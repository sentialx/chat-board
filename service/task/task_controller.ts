import {
  Controller,
  Body,
  Get,
  Param,
  Post,
  BadRequestException,
  UseGuards,
  Query,
} from "@nestjs/common";

import { UserEntity } from "../user/user_entity";
import { TaskService } from "./task_service";
import { CreateTaskDto, ListTasksRequest, TaskApi, UpdateTaskDto } from "../../common/task_api";
import { RoleService } from "../role/role_service";
import { TaskEntity } from "./task_entity";
import { WorkspaceService } from "../workspace/workspace_service";
import { UserService } from "../user/user_service";
import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";

@Controller("task")
export class TaskController {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly taskService: TaskService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post("create")
  @UseGuards(AuthGuard)
  public async create(
    @Body() body: CreateTaskDto,
    @SessionUser() user: UserEntity,
  ): Promise<TaskApi> {
    const role = (await this.roleService.fromUuid(body.roleUuid)).unwrap();
    await this.roleService.em.populate(role, ["workspace"]);
    await this.roleService.checkPermissions(user, role.workspace);

    if (!body.title) {
      throw new BadRequestException("Title is required");
    }

    if (!body.description) {
      body.description = "";
    }

    const task = await this.taskService.create({
      title: body.title,
      description: body.description,
      role,
      assignee: body.assigneeUuid
        ? (await this.userService.fromUuid(body.assigneeUuid)).unwrap()
        : undefined,
      status: body.status,
    });

    return this.taskService.asTaskApi(task);
  }

  @Post("remove")
  @UseGuards(AuthGuard)
  public async remove(
    @Body() body: { taskUuid: string },
    @SessionUser() user: UserEntity,
  ): Promise<void> {
    const task = (await this.taskService.fromUuid(body.taskUuid)).unwrap();
    await this.roleService.checkPermissions(user, task.role.workspace);

    await this.taskService.remove(task);
  }

  @Get(":uuid")
  @UseGuards(AuthGuard)
  public async get(
    @Param("uuid") uuid: string,
    @SessionUser() user: UserEntity,
  ): Promise<TaskApi> {
    const task = (await this.taskService.fromUuid(uuid)).unwrap();
    return this.taskService.asTaskApi(task);
  }

  @Get("list")
  @UseGuards(AuthGuard)
  public async list(
    @Query() query: ListTasksRequest,
    @SessionUser() user: UserEntity,
  ): Promise<TaskApi[]> {
    if (!query.workspaceUuid && !query.roleUuid) {
      throw new BadRequestException("WorkspaceUuid or roleUuid is required");
    }

    const role = query.roleUuid
      ? (await this.roleService.fromUuid(query.roleUuid)).unwrap()
      : undefined;
    const workspace = query.workspaceUuid
      ? (await this.workspaceService.fromUuid(query.workspaceUuid)).unwrap()
      : role?.workspace;

    await this.userService.checkIsInWorkspace(user, workspace);

    let tasks: TaskEntity[] = [];
    if (query.roleUuid) {
      tasks = await this.taskService.getAllByRole(query.roleUuid);
    } else if (query.workspaceUuid) {
      tasks = await this.taskService.getAllByWorkspace(query.workspaceUuid);
    }

    return Promise.all(tasks.map((t) => this.taskService.asTaskApi(t)));
  }

  @Post("update")
  @UseGuards(AuthGuard)
  public async update(
    @Body() body: UpdateTaskDto,
    @SessionUser() user: UserEntity,
  ): Promise<TaskApi> {
    const task = (await this.taskService.fromUuid(body.uuid)).unwrap();
    await this.roleService.em.populate(task, ["role"]);
    await this.roleService.checkRolePrivileges(user, task.role);

    const assignee = body.assigneeUuid
      ? (await this.userService.fromUuid(body.assigneeUuid)).unwrap()
      : undefined;

    if (assignee) {
      await this.userService.checkIsInWorkspace(assignee, task.role.workspace);
    }

    const role = body.roleUuid
      ? (await this.roleService.fromUuid(body.roleUuid)).unwrap()
      : undefined;

    if (role) {
      await this.roleService.checkRolePrivileges(user, role);
    }

    const updated = await this.taskService.updateAndTick(task, {
      title: body.title,
      description: body.description,
      status: body.status,
      assignee,
      role,
    });

    return this.taskService.asTaskApi(updated);
  }
}
