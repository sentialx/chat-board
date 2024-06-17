import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  Collection,
  ManyToMany,
  OneToMany,
  ManyToOne,
  Index,
  Enum,
} from "@mikro-orm/core";

import { AuthUserEntity } from "../auth/auth_user_entity";
import { MediaEntity } from "../media/media_entity";
import { UserEntity } from "../user/user_entity";

@Entity({ tableName: "workspaces" })
export class WorkspaceEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property()
  name!: string;

  @ManyToMany(() => UserEntity)
  users = new Collection<UserEntity>(this);

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @ManyToOne(() => MediaEntity, { nullable: true })
  icon?: typeof MediaEntity;
}

export interface CreateWorkspaceProperties {
  admin: UserEntity;
  name: string;
  icon?: MediaEntity;
}
