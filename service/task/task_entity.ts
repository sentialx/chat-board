import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
} from "@mikro-orm/core";
import { UserEntity } from "../user/user_entity";
import { TaskStatus } from "../../common/task_api";
import { RoleEntity } from "../role/role_entity";

@Entity({ tableName: "tasks" })
export class TaskEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property()
  title!: string;

  @Property()
  description!: string;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  assignee?: UserEntity;

  @Enum(() => TaskStatus)
  status!: TaskStatus;

  @ManyToOne(() => RoleEntity)
  role!: RoleEntity;
}

export interface CreateTaskProperties {
  title: string;
  description: string;
  status?: TaskStatus;
  assignee?: UserEntity;
  role: RoleEntity;
}
