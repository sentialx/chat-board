import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  Collection,
  ManyToMany,
  ManyToOne,
} from "@mikro-orm/core";

import { WorkspaceEntity } from "../workspace/workspace_entity";
import { UserEntity } from "../user/user_entity";

@Entity({ tableName: "roles" })
export class RoleEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property()
  name!: string;

  @Property()
  isPrivileged!: boolean;

  @ManyToOne(() => WorkspaceEntity)
  workspace!: WorkspaceEntity;

  @ManyToMany(() => UserEntity)
  users = new Collection<UserEntity>(this);

  @Property()
  removable!: boolean;
}

export interface CreateRoleProperties {
  name: string;
  workspace: WorkspaceEntity;
  isPrivileged?: boolean;
  removable?: boolean;
}
