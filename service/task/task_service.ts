import { EntityRepository, EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";

import { ConfigService } from "../config_service";
import { MediaService } from "../media/media_service";

import { CreateTaskProperties, TaskEntity } from "./task_entity";
import { UserService } from "../user/user_service";
import { RoleService } from "../role/role_service";
import { Option } from "~/common/js/option";
import { TaskApi, TaskStatus } from "~/common/task_api";

export class TaskService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    @InjectRepository(TaskEntity)
    private readonly taskRepo: EntityRepository<TaskEntity>,
    private readonly em: EntityManager,
  ) {}

  public async create(props: CreateTaskProperties): Promise<TaskEntity> {
    const task = new TaskEntity();
    task.title = props.title;
    task.description = props.description;
    task.status = TaskStatus.TODO;
    task.role = props.role;
    if (props.status) {
      task.status = props.status;
    }
    if (props.assignee) {
      task.assignee = props.assignee;
    }

    await this.em.transactional(async (em) => {
      await em.persistAndFlush([task]);
    });

    await this.autoAssignTick();

    return task;
  }

  public async asTaskApi(task: TaskEntity): Promise<TaskApi> {
    await this.em.populate(task, ["assignee"]);
    const data: TaskApi = {
      uuid: task.uuid,
      title: task.title,
      description: task.description,
      status: task.status,
      assigneeUuid: task.assignee?.uuid,
      createdAt: task.createdAt,
      roleUuid: task.role.uuid,
    };
    return data;
  }

  public async fromUuid(uuid: string): Promise<Option<TaskEntity>> {
    const user = await this.taskRepo.findOne({ uuid });
    return new Option(user, { error: new Error("Task not found") });
  }

  public async update(
    task: TaskEntity,
    props: Partial<CreateTaskProperties>,
  ): Promise<TaskEntity> {
    if (props.title) {
      task.title = props.title;
    }
    if (props.description) {
      task.description = props.description;
    }
    if (props.status) {
      task.status = props.status;
    }
    if (props.assignee) {
      task.assignee = props.assignee;
    }
    if (props.role) {
      task.role = props.role;
    }
    task.updatedAt = new Date();

    await this.em.transactional(async (em) => {
      await em.persistAndFlush([task]);
    });

    return task;
  }

  public async updateAndTick(
    task: TaskEntity,
    props: Partial<CreateTaskProperties>,
  ): Promise<TaskEntity> {
    const updated = await this.update(task, props);
    await this.autoAssignTick();
    return updated;
  }

  public async autoAssignTick(): Promise<void> {
    const tasks = await this.taskRepo.find({
      status: TaskStatus.TODO,
      assignee: null,
    });
    for (const task of tasks) {
      const users = await this.roleService.getUsers(task.role);
      if (users.length > 0) {
        const user = users[Math.floor(Math.random() * users.length)];
        await this.update(task, { assignee: user });
      }
    }
  }

  public async remove(task: TaskEntity): Promise<void> {
    await this.em.transactional(async (em) => {
      await em.removeAndFlush(task);
    });

    await this.autoAssignTick();
  }

  public async getAllByWorkspace(workspaceUuid: string): Promise<TaskEntity[]> {
    return this.taskRepo.find({ role: { workspace: { uuid: workspaceUuid } } });
  }

  public async getAllByRole(roleUuid: string): Promise<TaskEntity[]> {
    return this.taskRepo.find({ role: { uuid: roleUuid } });
  }
}
